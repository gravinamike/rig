<script lang="ts">
    // Import types.
    import type { OddHalfAxisId } from "$lib/shared/constants"
    import type { Graph, Direction, Space } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"
    import type { ThingDbModel } from "$lib/models/dbModels"

    // Import contants and utilty functions.
    import { oddHalfAxisIds } from "$lib/shared/constants"
    import { capitalizeFirstLetter, onMobile, sleep } from "$lib/shared/utility"

    // Import stores.
    import { addGraphIdsNeedingViewerRefresh, addSpaceIdToEditingInProgressStore, getGraphConstructs, readOnlyMode, removeSpaceIdFromEditingInProgressStore, spaceDbModelsStore, storeGraphDbModels } from "$lib/stores"

    // Import related widgets.
    import { DirectionMenuWidget } from "./directionMenuWidget"
    import { DirectionWidget } from "$lib/widgets/spaceWidgets"
    import DeleteWidget from "$lib/widgets/layoutWidgets/deleteWidget.svelte"
    import { Tooltip } from "$lib/widgets/layoutWidgets"
    
    // Import API functions.
    import { createSpace, deleteSpace, spaceIsReferenced, updateSpace, updateThingDefaultSpace } from "$lib/db"
    import { tick } from "svelte";
    import EditButton from "../layoutWidgets/editButton.svelte";


    /**
     * @param space - The Space which this widget represents (or null if this is a Space Form).
     * @param graph - The Graph that the Directions are part of.
     * @param graphWidgetStyle - Controls the visual style of the Graph.
     * @param setGraphSpace - Method to set the Graph's current Space.
     */
    export let space: Space | null
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle
    export let parentScrollArea: HTMLElement
    export let setGraphSpace: (space: Space) => void


    // Handles for HTML elements and their attributes.
    let spaceWidget: HTMLElement
    let spaceWidgetWidth = 1
    let spaceWidgetHeight = 1
    let spaceNameInput: HTMLInputElement
    let spaceBuildMethod: "radial" | "grid" = space?.buildmethod as ("radial" | "grid") || "radial"

    // Flags describing type of widget.
    let isSpaceForm = (space === null)

    // Flags describing interaction state.
    let isHovered = false
    let interactionMode: "display" | "editing" | "create" = isSpaceForm ? "editing" : "display"
    $: if ( space?.id && interactionMode === "editing" ) {
        addSpaceIdToEditingInProgressStore(space.id)
    } else if (space?.id) {
        removeSpaceIdFromEditingInProgressStore(space.id)
    }

    // Whether the Space is the default Space for the current Perspective Thing.
    $: defaultPerspectiveSpace = 
        graph.pThing?.defaultSpaceId
        && space?.id === graph.pThing.defaultSpaceId


    interface HalfAxisInfo { direction: Direction | null, formDirection: (Direction | "blank" | null) }
    type HalfAxisInfos = { [halfAxisId: number]: HalfAxisInfo }

    let halfAxisInfos: HalfAxisInfos = {}
    function buildHalfAxisInfos() {
        const newHalfAxisInfos: HalfAxisInfos = {}
        for (const oddHalfAxisId of oddHalfAxisIds) {
            const direction = space?.directions.find(direction => direction.halfaxisid === oddHalfAxisId) || null
            newHalfAxisInfos[oddHalfAxisId] = 
                {
                    direction: direction,
                    formDirection: direction
                }
        }
        halfAxisInfos = newHalfAxisInfos
    }
    buildHalfAxisInfos()

    let halfAxisInfosAsArray: [OddHalfAxisId, HalfAxisInfo][]
    $: halfAxisInfosAsArray = Object.entries(halfAxisInfos).map(
        ([halfAxisIdString, info]) => [Number(halfAxisIdString) as OddHalfAxisId, info]
    )


    /**
     * Handle-click method.
     * 
     * When Space widget is clicked, sets the Graph's Space to the Space
     * represented by the widget.
     */
    function handleClick() {
        if (space && interactionMode === "display" && !confirmDeleteBoxOpen) setGraphSpace(space)
    }

    /**
     * Handle-button method.
     * 
     * Activates editing mode or submits edited Space information.
     */
    async function handleButton() {
        // If the widget is in display mode,
        if (interactionMode === "display") {
            // Set widget to editing mode.
            interactionMode = "editing"
            await sleep(50) // Allow the fields to finish rendering.

            // Populate the fields and focus the Space name field.
            buildHalfAxisInfos()
            spaceNameInput.value = space?.text || ""
            spaceBuildMethod = space?.buildmethod as ("radial" | "grid") || "radial"
            await tick()
            spaceNameInput.focus()

        // If the widget is in editing mode,
        } else {
            // Submit the edited Space information.
            await submit()
            // Set widget back to display mode.
            interactionMode = "display"
        }
    }

    /**
     * Set-Perspective-Thing-default-Space method.
     * 
     * Sets the Space which the widget represents as the Perspective Thing's
     * default Space.
     */
    async function setPerspectiveThingDefaultSpace() {
        // If any necessary information is null or undefined, abort.
        if (!graph.pThing?.id || !space?.id) return

        // Set the Perspective Thing's default Space to this Space.
        await updateThingDefaultSpace(graph.pThing?.id, space.id)

        // Refresh Thing in the store, set the Graph's Space to this space, and
        // refresh the Graph.
        await storeGraphDbModels<ThingDbModel>("Thing", graph.pThing.id, true)
        await graph.setSpace(space)
        addGraphIdsNeedingViewerRefresh(graph.id)
    }

    /**
     * Remove-Direction-by-half-axis-ID method.
     * 
     * Remove a Direction from the Directions list dropdowns by its half-axis ID.
     */
    function setDirectionNullByHalfAxisId(halfAxisId: number) {
        halfAxisInfos[halfAxisId].formDirection = null
        halfAxisInfos = halfAxisInfos // Needed for reactivity.
    }

    /**
     * Add-Direction-by-half-axis-ID method.
     * 
     * Add a new Direction to the Directions list dropdowns by its half-axis ID.
     */
    function setDirectionNotNullByHalfAxisId(halfAxisId: number) {
        halfAxisInfos[halfAxisId].formDirection = "blank"
        halfAxisInfos = halfAxisInfos // Needed for reactivity.
    }

    /**
     * Validate method.
     * 
     * Determine whether the edited Space information is valid before submitting.
     */
    function validate() {
        const valid =
            (
                spaceNameInput.value !== ""
                && Object.values(halfAxisInfos).every(info => info.formDirection !== "blank")
            ) ? true :
            false
        return valid
    }

    /**
     * Submit method.
     * 
     * Submit edited Space info to change the Space.
     */
    async function submit() {
        // If the edited Space information isn't valid, abort.
        const validInputs = validate()
        if ( !validInputs || (!isSpaceForm && !space?.id) ) return
        const halfAxisIdsAndDirections = halfAxisInfosAsArray.map(
            ([halfAxisId, halfAxisInfo]) => [halfAxisId, halfAxisInfo.formDirection as Direction | null]
        ) as [OddHalfAxisId, (Direction | null)][]

        // Update (or create) the Space in the database, store, and this widget.
        if (isSpaceForm) {
            const newSpaceId = await createSpace(
                spaceNameInput.value,
                spaceBuildMethod,
                halfAxisIdsAndDirections
            ) || null
            await storeGraphDbModels("Space")
            space = getGraphConstructs("Space", newSpaceId as number) as Space
            isSpaceForm = false
            parentScrollArea.scrollTo({top: parentScrollArea.scrollHeight, behavior: "smooth"})
        } else {
            await updateSpace(
                space?.id as number,
                spaceNameInput.value,
                spaceBuildMethod,
                halfAxisIdsAndDirections
            )
            await storeGraphDbModels("Space")
            space = getGraphConstructs("Space", space?.id as number) as Space
        }


        // If the Graph is displayed in this Space, rebuild and refresh the
        // Graph to reflect the changes
        if (space && graph.pThing?.space?.id === space.id)
            setGraphSpace(space)

        // Rebuild the widget's Direction list.
        buildHalfAxisInfos()
    }

    function handlePossibleOutsideClick(event: MouseEvent) {
		if (event.target !== spaceWidget && !spaceWidget.contains(event.target as Node)) {
			cancel()
            isHovered = false
            confirmDeleteBoxOpen = false
		}
	}




    async function cancel() {
        // Reset the half-axis infos.
        buildHalfAxisInfos()

        // Set the interaction mode back to its default.
        interactionMode = isSpaceForm ? "editing" : "display"
    }





    let confirmDeleteBoxOpen = false
    $: showDeleteButton = isHovered && !confirmDeleteBoxOpen
    



    /**
     * Delete-Space method.
     * 
     * Completes a delete operation after it has been confirmed.
     */
    async function completeDelete() {
        // If Space or Space ID is null, abort.
        if (!space?.id) return

        // If the Direction is referenced by other structures, ask the user if
        // they want to continue.
        if (await spaceIsReferenced(space.id)) {
            if (!confirm(`The Space named "${space.text}" is referenced by other structures. Deleting it will remove it from those structures. Continue?`)) {
                return
            }
        }

        // Delete the Space in the Graph.
        await deleteSpace(space.id)

        // Delete the Space from the stores.
        spaceDbModelsStore.update( (current) => { delete current[space?.id as number]; return current } )
    }


    let expanded = false
</script>


<!-- Escape key on page body disables interaction mode. -->
<svelte:body
    on:click={handlePossibleOutsideClick}
    on:keyup={(event) => {
        if (event.key === "Escape") cancel()
    } }
/>


<!-- Space widget. -->
<div
    class="space-widget"
    class:on-mobile={onMobile()}
    class:editing={interactionMode === "editing"}
    class:create={interactionMode === "create"}
    
    bind:this={spaceWidget}
    bind:clientWidth={spaceWidgetWidth}
    bind:clientHeight={spaceWidgetHeight}

    on:mouseenter={() => {isHovered = true}}
    on:mouseleave={() => {
        isHovered = false
        confirmDeleteBoxOpen = false
    }}
    on:click={handleClick}
    on:dblclick={() => { if (!$readOnlyMode && interactionMode === "display" && !confirmDeleteBoxOpen) handleButton() }}
    on:keydown={()=>{}}
>
    <!-- Space name or name-input field. -->
    <div class="space-name">
        <div>
            {#if interactionMode === "display"}
                {space?.text}
            {:else}
                <input
                    type="text"
                    placeholder="Space name"
                    bind:this={spaceNameInput}
                />
            {/if}
        </div>
    </div>

    <!-- List of Direction widgets or Direction-selecting dropdowns. -->
    <div
        class="direction-list"

        style="gap: {interactionMode === "display" ? 1 : 0.4}rem;"
    >
        {#each halfAxisInfosAsArray as [halfAxisId, info]}

            <!-- Direction name. -->
            {#if interactionMode === "display"}
                {#if info.direction}
                    <DirectionMenuWidget
                        direction={info.direction}
                        halfAxisId={halfAxisId}
                        forceExpanded={expanded}
                        editable={false}
                        showBackground={false}
                        showDirectionIcon={true}
                        {graph}
                        {graphWidgetStyle}
                        buttonOnWhichSide={"left"}
                    />
                {/if}

            <!-- Direction-selecting dropdown. -->
            {:else}
                {#if info.formDirection}
                    <div
                        class="direction-dropdown-container"
                    >
                        <DirectionWidget
                            startingDirection={info.formDirection !== "blank" ? info.direction : null}
                            halfAxisId={halfAxisId}
                            {graphWidgetStyle}
                            circularOrRectangular={"rectangular"}
                            forceFullyOpaque={true}
                            optionClickedFunction={(direction, _, __) => {
                                info.formDirection = direction
                                info.direction = direction
                            }}
                            optionHoveredFunction={async () => {
                            }}
                            exitOptionHoveredFunction={async () => {
                            }}
                        />

                        {#if info.direction}
                            <DeleteWidget
                                showDeleteButton={true}
                                confirmDeleteBoxOpen={false}
                                thingWidth={50}
                                thingHeight={50}
                                encapsulatingDepth={0}
                                distanceFromTop={4}
                                startDelete={() => {setDirectionNullByHalfAxisId(halfAxisId)}}
                                completeDelete={()=>{}}
                            />
                        {/if}
                    </div>
                {:else}
                    <div
                        class="no-direction"
                        
                        on:click|stopPropagation={() => {setDirectionNotNullByHalfAxisId(halfAxisId)}}
                        on:keydown={()=>{}}
                    >
                        None
                        <div class="add-button">
                            <div class="add-button-text">+</div>
                        </div>
                    </div>
                {/if}
            {/if}
        {/each}
    </div>

    <!-- Space build method field. -->
    {#if interactionMode !== "display" || expanded}
        <div
            class="space-build-method"
            style="
                padding: 10px 5px 0 10px;

                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: space-between;

                font-size: 0.75rem;
                gap: 5px;

                {
                    (interactionMode === "display" && expanded) ? "opacity: 50%; pointer-events: none;" :
                    ""
                }
            "
        >
        
            <strong>Graph build method:</strong>
            <div style="
                display: flex;
                flex-direction: row;
                gap: 10px;
            ">
                {#each ["radial", "grid"] as buildMethodOption}
                    <div
                        style="
                            display: flex;
                            flex-direction: row;
                        "
                    >
                        <label for={buildMethodOption}>{capitalizeFirstLetter(buildMethodOption)}</label>
                        <input
                            type="radio"
                            id={buildMethodOption}
                            value={buildMethodOption}
                            bind:group={spaceBuildMethod}
                        />
                    </div>
                {/each}
            </div>

        </div>
    {/if}

    <!-- Perspective-Space button. -->
    {#if interactionMode === "display" && (defaultPerspectiveSpace || (!$readOnlyMode && isHovered))}
        <div
            class="perspective-space-button"
            class:is-default-perspective={defaultPerspectiveSpace}
            class:read-only-mode={$readOnlyMode}

            on:click|stopPropagation={ () => { if (!$readOnlyMode) setPerspectiveThingDefaultSpace() } }
            on:keydown={()=>{}}
        >
            <img
                src="./icons/perspective.png"
                alt="Perspective indicator"
                width={onMobile() ? "20px" : "25px"}
                height={onMobile() ? "20px" : "25px"}
                style={`opacity: ${ defaultPerspectiveSpace ? 75 : 25 }%;`}
            >

            <Tooltip
                text={
                    defaultPerspectiveSpace ? "Is default Space for current\nPerspective Thing." :
                    "Set as default Space for current\nPerspective Thing."
                }
                direction={"down"}
                lean={"right"}
            />
        </div>
    {/if}

    <!-- Direction name. -->
    {#if interactionMode === "display" && isHovered && !confirmDeleteBoxOpen}
        <div class="expand-button-container">
            <button
                class="button"
                tabindex=0

                on:click|stopPropagation={() => expanded = !expanded}
            >
                <Tooltip
                    text={`${expanded ? "Hide" : "Show"} details.`}
                    direction={"down"}
                    lean={"left"}
                />
                <div>
                    ...
                </div>
            </button>
        </div>
    {/if}

    <!-- Mode button. -->
    {#if !$readOnlyMode && isHovered || (interactionMode === "editing" || interactionMode === "create")}
        <div
            class="container button-container"
            class:editing={interactionMode === "editing"}
        >
            <EditButton
                {interactionMode}
                tooltipText={
                    interactionMode === "display" ? "Edit Space." :
                    interactionMode === "editing" ? "Submit changes to Space." :
                    "Create Space"
                }
                onClick={handleButton}
            />
        </div>
    {/if}




    <!-- Delete-Space widget. -->
    <DeleteWidget
        {showDeleteButton}
        bind:confirmDeleteBoxOpen
        thingWidth={spaceWidgetWidth}
        thingHeight={spaceWidgetHeight}
        encapsulatingDepth={0}
        trashIcon={interactionMode !== "editing"}
        tooltipText={
            interactionMode === "display" ? "Delete Space." :
            interactionMode === "editing" ? "Cancel editing." :
            null
        }
        startDelete={() => {
            if (interactionMode === "editing") {
                cancel()
            } else {
                confirmDeleteBoxOpen = true
            }
        } }
        {completeDelete}
    />





</div>


<style>
    .space-widget {
        border-radius: 7px;
        box-shadow: 1px 1px 2px 1px silver;

        position: relative;
        height: max-content;
        background-color: #f0f0f0;
        
        display: flex;
        flex-direction: column;
        padding: 0.33rem 0.33rem 0.57rem 0.33rem;
        gap: 10px;

        font-size: 0.65rem;
        text-align: left;

        cursor: default;
    }

    .space-widget.on-mobile {
        gap: 6px;
    }

    .space-widget:not(.editing):not(.create):hover {
        outline: solid 1px lightgrey;
        background-color: #e8e8e8;
    }

    .space-widget.editing, .space-widget.create {
        outline: solid 1px grey;
    }

    .space-widget:not(.editing):not(.create):active {
        background-color: #e0e0e0;
    }

    .space-name {
        display: flex;
        flex-direction: row;
        gap: 5px;
        justify-content: center;

        font-size: 1rem;
        text-align: center;
    }

    .space-widget.on-mobile .space-name {
        font-size: 0.8rem;
    }

    .direction-list {
        display: flex;
        flex-direction: column;
    }

    .space-name input {
        border-radius: 3px;
        border: solid 1px silver;
        outline: none;
        border-style: inset;

        width: 80%;
        height: 1.5rem;
        background-color: transparent;

        text-align: center;

        font-size: 1rem;
    }

    .container {
        overflow: visible;
    }

    .direction-dropdown-container {
        position: relative;
    }

    .button-container {
        width: 100%;
        height: 15px;

        display: flex;
        flex-direction: row;
        justify-content: flex-end;
    }

    .button-container:not(.editing) {
        position: absolute;
        right: 5px;
        bottom: 5px;
    }

    .expand-button-container {
        position: absolute;
        right: 25px;
        top: 4px;
        width: 14px;
        height: 14px;
    }

    .expand-button-container button {
        border: none;
        border-radius: 50%;

        position: relative;
        width: 14px;
        height: 14px;
        background-color: white;

        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        font-size: 0.75rem;
    }

    .expand-button-container button div {
        transform: translate(0%, -25%);

        pointer-events: none;
    }

    .perspective-space-button {
        border-radius: 50%;

        position: absolute;
        width: 26px;
        height: 26px;
        top: 4px;
        left: 4px;
        background-color: rgb(230, 230, 230);

        display: flex;
        justify-content: center;
        align-items: center;

        pointer-events: none;
    }

    .space-widget.on-mobile .perspective-space-button {
        width: 20px;
        height: 20px;
    }

    .perspective-space-button:not(.read-only-mode) {
        pointer-events: auto;
        cursor: pointer;
    }

    .perspective-space-button:hover {
        outline: solid 1px lightgrey;

        background-color: whitesmoke;
    }

    .perspective-space-button.is-default-perspective {
        background-color: white;
    }

    .no-direction {
        outline: dotted 1px grey;
        border-radius: 7px;
        outline-offset: -1px;
        box-sizing: border-box;

        position: relative;
        height: 26px;
        
        padding: 5px;

        font-size: 0.9rem;
    }

    .space-widget.editing .no-direction {
        text-align: center;
    }

    .add-button {
        outline: solid 1px grey;
        border-radius: 50%;

        position: absolute;
        right: 5px;
        top: 6px;
        width: 12px;
        height: 12px; 
        
        font-size: 1.2rem;
        color: grey;
    }

    .add-button:hover {
        background-color: silver;
    }

    .add-button:active {
        background-color: darkgray;
    }

    .add-button-text {
        position: relative;
        left: 0.425px;
        top: -5.5px;

        font-family: "Arial";
    }

    .space-build-method input {
        margin-top: 0;
        margin-bottom: 0;
    }

    .space-build-method input:checked {
        accent-color: dimgrey;
    }
</style>