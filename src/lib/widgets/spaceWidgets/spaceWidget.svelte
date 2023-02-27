<script lang="ts">
    // Import types.
    import type { OddHalfAxisId } from "$lib/shared/constants"
    import type { Graph, Direction, Space } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"
    import type { ThingDbModel } from "$lib/models/dbModels/clientSide"

    // Import contants and utilty functions.
    import { oddHalfAxisIds } from "$lib/shared/constants"
    import { sleep } from "$lib/shared/utility"

    // Import stores.
    import { addGraphIdsNeedingViewerRefresh, getGraphConstructs, readOnlyMode, storeGraphDbModels } from "$lib/stores"

    // Import related widgets.
    import { DirectionWidget } from "./directionWidget"
    import { DirectionDropdownWidget } from "$lib/widgets/spaceWidgets"
    import DeleteWidget from "$lib/widgets/layoutWidgets/deleteWidget.svelte"
    
    // Import API functions.
    import { updateSpace, updateThingDefaultSpace } from "$lib/db/clientSide"


    /**
     * @param space - The Space which this widget represents.
     * @param graph - The Graph that the Directions are part of.
     * @param graphWidgetStyle - Controls the visual style of the Graph.
     * @param setGraphSpace - Method to set the Graph's current Space.
     */
    export let space: Space
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle
    export let setGraphSpace: (space: Space) => void


    // Object handles for HTML elements.
    let spaceWidget: HTMLElement
    let spaceNameInput: HTMLInputElement

    // Flags describing interaction state.
    let isHovered = false
    let interactionMode: "display" | "editing" | "create" = "display"

    // Whether the Space is the default Space for the current Perspective Thing.
    $: defaultPerspectiveSpace = 
        graph.pThing?.defaultSpaceId
        && space.id === graph.pThing.defaultSpaceId


    interface HalfAxisInfo { direction: Direction | null, formDirection: (Direction | "blank" | null) }
    type HalfAxisInfos = { [halfAxisId: number]: HalfAxisInfo }

    let halfAxisInfos: HalfAxisInfos = {}
    function buildHalfAxisInfos() {
        const newHalfAxisInfos: HalfAxisInfos = {}
        for (const oddHalfAxisId of oddHalfAxisIds) {
            const direction = space.directions.find(direction => direction.halfaxisid === oddHalfAxisId) || null
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
        if (interactionMode === "display") setGraphSpace(space)
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
            spaceNameInput.value = space.text || ""
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
        if (!graph.pThing?.id || !space.id) return

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
        if ( !validInputs || !space.id ) return

        const halfAxisIdsAndDirections = halfAxisInfosAsArray.map(
            ([halfAxisId, halfAxisInfo]) => [halfAxisId, halfAxisInfo.formDirection as Direction | null]
        ) as [OddHalfAxisId, (Direction | null)][]

        // Update the Space in the database, store, and this widget.
        await updateSpace(space.id, spaceNameInput.value, halfAxisIdsAndDirections)
        await storeGraphDbModels("Space")
        space = getGraphConstructs("Space", space.id) as Space


        // If the Graph is displayed in this Space, rebuild and refresh the
        // Graph to reflect the changes
        if (graph.pThing?.space?.id === space.id)
            setGraphSpace(space)

        // Rebuild the widget's Direction list.
        buildHalfAxisInfos()
    }

    function handlePossibleOutsideClick(event: MouseEvent) {
		if (event.target !== spaceWidget && !spaceWidget.contains(event.target as Node)) {
			interactionMode = "display"
		}
	}
</script>


<!-- Escape key on page body disables interaction mode. -->
<svelte:body
    on:click={handlePossibleOutsideClick}
    on:keyup={(event) => {
        if (event.key === "Escape") interactionMode = "display"
    } }
/>


<!-- Space widget. -->
<div
    class="space-widget"
    class:editing={interactionMode === "editing"}
    class:create={interactionMode === "create"}
    
    bind:this={spaceWidget}

    on:mouseenter={() => {isHovered = true}}
    on:mouseleave={() => {isHovered = false}}
    on:click={handleClick}
    on:dblclick={() => { if (!$readOnlyMode && interactionMode === "display") handleButton() }}
    on:keydown={()=>{}}
>
    <!-- Space name or name-input field. -->
    <div class="space-name">
        <div>
            {#if interactionMode === "display"}
                {space.text}
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
    <div class="direction-list">
        {#each halfAxisInfosAsArray as [halfAxisId, info], index}

            <!-- Direction name. -->
            {#if interactionMode === "display"}
                {#if info.direction}
                    <DirectionWidget
                        direction={info.direction}
                        halfAxisId={halfAxisId}
                        editable={false}
                        {graph}
                        {graphWidgetStyle}
                        buttonToShow={"expand"}
                        buttonOnWhichSide={"left"}
                    />
                {/if}

            <!-- Direction-selecting dropdown. -->
            {:else}
                {#if info.formDirection}
                    <div
                        class="direction-dropdown-container"
                        style="z-index: {4 - index};"
                    >
                        <DirectionDropdownWidget
                            startingDirection={info.formDirection !== "blank" ? info.direction : null}
                            halfAxisId={halfAxisId}
                            {graphWidgetStyle}
                            optionClickedFunction={(direction, _, __) => {
                                info.formDirection = direction
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
                                elongationCategory="neutral"
                                startDelete={() => {setDirectionNullByHalfAxisId(halfAxisId)}}
                                completeDelete={()=>{}}
                            />
                        {/if}
                    </div>
                {:else}
                    <div class="no-direction">
                        None
                        <div
                            class="add-button"

                            on:click|stopPropagation={() => {setDirectionNotNullByHalfAxisId(halfAxisId)}}
                            on:keydown={()=>{}}
                        >
                            <div class="add-button-text">+</div>
                        </div>
                    </div>
                {/if}
            {/if}
        {/each}
    </div>

    <!-- Perspective-Space button. -->
    {#if defaultPerspectiveSpace || (!$readOnlyMode && isHovered)}
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
                width="25px"
                height="25px"
                style={`opacity: ${ defaultPerspectiveSpace ? 75 : 25 }%;`}
            >
        </div>
    {/if}

    <!-- Mode button. -->
    {#if !$readOnlyMode && (isHovered || interactionMode === "editing" || interactionMode === "create")}
        <div
            class="container button-container"
            class:editing={interactionMode === "editing"}
        >
            <button
                class="button"
                class:editing={interactionMode === "editing"}
                class:create={interactionMode === "create"}
                tabindex=0

                on:click={handleButton}
                on:keypress={(event) => {
                    if (event.key === "Enter") handleButton()
                }}
            >
                {#if interactionMode === "display"}
                    <img src="./icons/edit.png" alt="Edit Space" width=15px height=15px style="pointer-events: none;" />
                {:else if interactionMode === "editing"}
                    ✓
                {:else}
                    +
                {/if}
            </button>
        </div>
    {/if}
</div>


<style>
    .space-widget {
        border-radius: 7px;

        position: relative;
        height: max-content;
        background-color: #e0e0e0;
        
        display: flex;
        flex-direction: column;
        padding: 0.33rem;
        gap: 10px;

        font-size: 0.65rem;
        text-align: left;

        cursor: default;
    }

    .space-widget:hover {
        outline: solid 1px lightgrey;
        background-color: gainsboro;
    }

    .space-widget.editing, .space-widget.create {
        outline: solid 1px grey;
    }

    .space-widget:active {
        background-color: lightgrey;
    }

    .space-widget:active {
        background-color: lightgrey;
    }

    .space-name {
        display: flex;
        flex-direction: row;
        gap: 5px;

        font-size: 1rem;
    }

    .direction-list {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    input {
        border: none;

        width: 90%;
        background-color: transparent;

        text-align: center;

        font-size: 1rem;
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

    .button {
        border: none;
        border-radius: 5px;
        box-shadow: 1px 1px 2px 1px grey;
        
        width: 15px;
        height: 15px;

        display: flex;
        justify-content: center;
        align-items: center;

        font-size: 0.75rem;
        font-weight: 600;

        cursor: pointer;
    }

    .button:hover, .button:focus {
        box-shadow: 2px 2px 5px 1px grey;

        background-color: lightgrey;
    }

    .button:active {
        outline: solid 1px grey;
        box-shadow: 1px 1px 2px 1px grey;

        background-color: grey;
    }

    .button.editing {
        outline-color: #d0f0c0;
        background-color: #d0f0c0;
        color: green;
    }

    .button.editing:hover, .button.editing:focus {
        outline-color: #ace1af;
        background-color: #ace1af;
    }

    .button.editing:active {
        outline-color: #8fbc8f;
        background-color: #8fbc8f;
    }

    .button.create {
        outline-color: #fac3ae;

        background-color: #fac3ae;

        font-size: 1rem;
        color: darkred;
    }

    .button.create:hover, .button.create:focus {
        outline-color: #ffa07a;
        background-color: #ffa07a;
    }

    .button.create:active {
        outline-color: #fa8072;
        background-color: #fa8072;
    }

    .perspective-space-button {
        border-radius: 50%;

        position: absolute;
        width: 26px;
        height: 26px;
        top: 4px;
        right: 4px;
        background-color: rgb(230, 230, 230);

        display: flex;
        justify-content: center;
        align-items: center;

        pointer-events: none;
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
        outline: solid 1px rgb(175, 175, 175);

        background-color: white;
    }

    .no-direction {
        outline: dashed 1px grey;
        border-radius: 7px;

        position: relative;
        height: 1rem;
        
        padding: 5px;

        font-size: 0.9rem;
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
    }
</style>