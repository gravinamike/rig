<script lang="ts">
    // Import types.
    import type { Direction, Graph } from "$lib/models/constructModels"
    import type { HalfAxisId } from "$lib/shared/constants"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"

    // Import stores and utility functions.
    import {
        addGraphIdsNeedingViewerRefresh, directionDbModelsStore, getGraphConstructs, readOnlyMode, addDirectionIdToEditingInProgressStore, removeDirectionIdFromEditingInProgressStore, storeGraphDbModels
    } from "$lib/stores"
    import { onMobile, sleep } from "$lib/shared/utility"

    // Import related widgets.
    import VerbAndObject from "./verbAndObject.svelte"
    import DeleteWidget from "$lib/widgets/layoutWidgets/deleteWidget.svelte"

    // Import API methods.
    import { createDirection, updateDirection, deleteDirection, directionIsReferenced } from "$lib/db"
    import { tick } from "svelte";
    import EditButton from "$lib/widgets/layoutWidgets/editButton.svelte";


    /**
     * @param direction - The Direction that this widget represents.
     * @param editable - Whether the Direction can be edited through this widget.
     * @param graph - The Graph that the Directions are part of.
     * @param graphWidgetStyle - Controls the visual style of the Graph.
     */
    export let direction: Direction | null
    export let halfAxisId: HalfAxisId | null = null
    export let editable = true
    export let forceExpanded = false
    export let showBackground = true
    export let showDirectionIcon = false
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle
    export let buttonToShow: "expand" | "edit" | null = null
    export let buttonOnWhichSide: "left" | "right"
    export let parentScrollArea: HTMLElement | null = null
    export let removeDirectionForm: () => void = () => {}


    let expanded = false


    // Object handles for HTML elements.
    let directionWidget: HTMLElement
    let directionWidgetWidth = 1
    let directionWidgetHeight = 1
    let directionNameInput: HTMLInputElement
    let objectNameInput: HTMLInputElement


    // Flags describing type of widget.
    let isDirectionForm = (direction === null)


    // Direction-related attributes.
    $: oppositeDirection =
        direction?.oppositeid ? getGraphConstructs("Direction", direction.oppositeid) as Direction | null :
        null
    let oppositeDirectionInForm = oppositeDirection

    // Attributes controlling visual appearance of widget.
    const directionHeight = 20
    let arrowAndBoxWidth = 1

    // Attributes indicating interaction state of widget.
    let isHovered = false
    let interactionMode: "display" | "editing" | "create" = isDirectionForm ? "editing" : "display"
    $: if ( direction?.id && interactionMode === "editing" ) {
        addDirectionIdToEditingInProgressStore(direction.id)
    } else if (direction?.id) {
        removeDirectionIdFromEditingInProgressStore(direction.id)
    }
    $: oppositeDisplayMode =
        ( interactionMode === "editing" || interactionMode === "create" || expanded || forceExpanded ) ? "full" :
        "none"


    /**
     * Handle-button method.
     * 
     * Handles actions that result when the widget's button is clicked.
     */
    async function handleButton() {
        // If the widget is currently in display mode,
        if (interactionMode === "display") {
            // Change it to editing mode.
            interactionMode = "editing"
            await sleep(50) // Allow the fields to finish rendering.

            // Set its initial content.
            directionNameInput.value = direction?.text || ""
            objectNameInput.value = direction?.nameforobjects || ""
            oppositeDirectionInForm = oppositeDirection

            // Give it keyboard focus.
            await tick()
            directionNameInput.focus()

        // Otherwise (if the widget is in editing mode),
        } else {
            // Submit any changes to the Space.
            await submit()

            // Change the widget back to display mode.
            interactionMode = "display"
        }
    }

    /**
     * Validate method.
     * 
     * Determines whether the current form entries are valid for submission.
     */
    function validate() {
        const valid = 
            // If the name and object name inputs aren't blank, it's valid.
            (
                directionNameInput.value !== ""
                && objectNameInput.value !== ""
            ) ? true :

            // Otherwise it's not valid.
            false

        return valid
    }

    /**
     * Submit method.
     * 
     * Submits any changes to the Space.
     */
    async function submit() {
        // If the current form entries aren't valid, abort.
        const validInputs = validate()
        if (!validInputs || (!isDirectionForm && !direction?.id )) return

        


        // Update (or create) the Direction in the database, store, Space, and this widget.
        if (isDirectionForm) {
            const newDirectionId = await createDirection(
                directionNameInput.value,
                objectNameInput.value,
                oppositeDirectionInForm?.id || null
            ) || null
            await storeGraphDbModels("Space")
            await storeGraphDbModels("Direction")
            direction = getGraphConstructs("Direction", newDirectionId as number) as Direction
            isDirectionForm = false
            parentScrollArea?.scrollTo({top: parentScrollArea.scrollHeight, behavior: "smooth"})
        } else {
            await updateDirection(
                direction?.id as number,
                directionNameInput.value,
                objectNameInput.value,
                oppositeDirectionInForm?.id || null
            )
            await storeGraphDbModels("Space")
            await storeGraphDbModels("Direction")
            direction = getGraphConstructs("Direction", direction?.id as number) as Direction
        }

        // Rebuild and refresh the Graph.
        await graph.build()
        addGraphIdsNeedingViewerRefresh(graph.id)
    }

    function handlePossibleOutsideClick(event: MouseEvent) {
		if (event.target !== directionWidget && !directionWidget.contains(event.target as Node)) {
			cancel()
            isHovered = false
            confirmDeleteBoxOpen = false
		}
	}




    let confirmDeleteBoxOpen = false
    $: showDeleteButton = interactionMode === "editing" || (isHovered && !confirmDeleteBoxOpen)



    /**
     * Delete-Direction method.
     * 
     * Completes a delete operation after it has been confirmed.
     */
    async function completeDelete() {
        // If Direction or Direction ID is null, abort.
        if (!direction?.id) return

        // If the Direction is referenced by other structures, ask the user if
        // they want to continue.
        if (await directionIsReferenced(direction.id)) {
            if (!confirm(`The Direction named "${direction.text}" is referenced by other structures. Deleting it will remove it from those structures. Continue?`)) {
                return
            }
        }

        // Delete the Direction in the Graph.
        await deleteDirection(direction.id)

        // Remove the Direction from the stores.
        directionDbModelsStore.update( (current) => { delete current[direction?.id as number]; return current } )
        await storeGraphDbModels("Direction")
        await storeGraphDbModels("Space")
    }


    /**
     * Cancel method.
     * 
     * Cancels the create-Direction or edit-Direction operation.
    */
    async function cancel() {
        if (isDirectionForm) {
            removeDirectionForm()
        } else {
            interactionMode = "display"
        }
    }

    
</script>


<!-- Set up body escape-key handler to disable editing mode. -->
<svelte:body
    on:click={handlePossibleOutsideClick}
    on:keyup={(event) => {
        if (event.key === "Escape") cancel()
    } }
/>


<!-- Direction widget. -->
<div
    class="direction-widget container horizontal"
    class:show-background={showBackground}
    class:on-mobile={onMobile()}
    class:editing={interactionMode === "editing"}
    class:create={interactionMode === "create"}

    bind:this={directionWidget}
    bind:clientWidth={directionWidgetWidth}
    bind:clientHeight={directionWidgetHeight}

    on:mouseenter={() => {isHovered = true}}
    on:mouseleave={() => {
        isHovered = false
        confirmDeleteBoxOpen = false
    }}
    on:dblclick={() => {
        if (!$readOnlyMode && interactionMode === "display" && editable && !confirmDeleteBoxOpen) handleButton()
    }}
>
    <!-- Direction icon. -->
    {#if showDirectionIcon}
        <div
            class="direction-icon-container"

            style="transform: rotate({
                halfAxisId === null ? 0 :
                halfAxisId === 1 ? 90 :
                halfAxisId === 3 ? 0 :
                45
            }deg);"
        >
            <img
                src="./icons/direction.png"
                alt="Direction icon"
                width=20px
                height=20px
            >
        </div>
    {/if}

    <!-- Arrows and object boxes container. -->
    <div
        class="container vertical arrows-and-boxes"
        bind:clientWidth={arrowAndBoxWidth}

        style={`order: ${buttonOnWhichSide === "left" ? 1: 0}`}
    >
        <!-- Direction. -->
        <VerbAndObject
            {direction}
            {halfAxisId}
            verbAndObjectWidth={arrowAndBoxWidth}
            verbAndObjectHeight={directionHeight}
            opposite={false}
            displayMode={"full"}
            {interactionMode}
            {graphWidgetStyle}
            bind:directionNameInput
            bind:objectNameInput
        />
        
        <!-- Opposite Direction -->
        {#if (
            oppositeDirection
            || interactionMode === "editing"
            || interactionMode === "display"
        ) && !(oppositeDisplayMode === "none")}
            <div class="opposite-container">
                <VerbAndObject
                    bind:direction={oppositeDirection}
                    {halfAxisId}
                    verbAndObjectWidth={arrowAndBoxWidth}
                    verbAndObjectHeight={directionHeight}
                    opposite={true}
                    displayMode={"small"} 
                    {interactionMode}
                    bind:directionInForm={oppositeDirectionInForm}
                    {graphWidgetStyle}
                />
            </div>
        {/if}
    </div>
        

    <!-- Expand button. -->
    {#if
        buttonToShow === "expand"
        && isHovered
        && !(
            interactionMode === "editing"
            || interactionMode === "create"
        )
    }
        <div class="container button-container">
            <button
                class="button"
                tabindex=0

                on:click|stopPropagation={() => expanded = !expanded}
            >
                ▼
            </button>
        </div>
    {/if}

    <!-- Edit button. -->
    {#if !$readOnlyMode}

        
        {#if
            buttonToShow === "edit"
            && editable
            && (
                isHovered
                || interactionMode === "editing"
                || interactionMode === "create"
            )
            && !confirmDeleteBoxOpen
        }
            <div
                class="container button-container"
                class:editing={interactionMode === "editing"}
            >
                <EditButton
                    {interactionMode}
                    tooltipText={
                        interactionMode === "display" ? "Edit Direction." :
                        interactionMode === "editing" ? "Submit changes to Direction." :
                        "Create Direction."
                    }
                    onClick={handleButton}
                />
            </div>
        {/if}

    {/if}

    <!-- Delete-Space widget. -->
    {#if editable}
        <DeleteWidget
            {showDeleteButton}
            bind:confirmDeleteBoxOpen
            thingWidth={directionWidgetWidth}
            thingHeight={directionWidgetHeight}
            encapsulatingDepth={0}
            trashIcon={interactionMode !== "editing"}
            tooltipText={
                interactionMode === "display" ? "Delete Direction." :
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
    {/if}

</div>


<style>
    .direction-widget {
        position: relative;

        font-size: 0.65rem;

        cursor: default;
    }

    .direction-widget.show-background {
        border-radius: 5px;
        box-shadow: 1px 1px 2px 1px silver;

        padding: 0.5rem 0.25rem 0.5rem 0.25rem;

        background-color: rgb(244, 244, 244);
    }

    .direction-widget.editing, .direction-widget.create {
        outline: solid 1px lightgrey;

        z-index: 1;
    }

    .direction-icon-container {
        width: 20px;
        height: 20px;
    }

    .container {
        position: relative;

        display: flex;
        justify-content: space-between;
        align-items: center;

        overflow: visible;
    }

    .horizontal {
        flex-direction: row;
    }

    .vertical {
        flex-direction: column;
        gap: 2px;
    }

    .arrows-and-boxes {
        flex: 1 1 0;
    }

    .opposite-container {
        opacity: 50%;
    }

    .button-container {
        margin-top: 22px;
        margin-right: 2px;

        width: 15px;
        height: 15px;
    }

    .button-container:not(.editing) {
        position: absolute;
        right: 4px;
        bottom: 6px;
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
  </style>