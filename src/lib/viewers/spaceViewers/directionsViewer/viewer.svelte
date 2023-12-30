<script lang="ts">
    // Import types.
    import type { Direction, Graph } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"
    import type { DirectionDbModel } from "$lib/models/dbModels"

    // Import framework functions.
    import { tick } from "svelte"
    import { flip } from "svelte/animate"

    // Import stores and utility functions.
    import { directionDbModelsStoreAsArray, directionEditingInProgressIdStore, getGraphConstructs, readOnlyMode, storeGraphDbModels, uIBackgroundColorStore } from "$lib/stores"
    import { changeIndexInArray, onMobile, sleep } from "$lib/shared/utility"

    // Import related widgets.
    import { Tooltip } from "$lib/widgets/layoutWidgets"
    import { DirectionMenuWidget } from "$lib/widgets/spaceWidgets"

    // Import API methods.
    import { reorderDirection } from "$lib/db"


    /**
     * @param graph - The Graph that the Directions are part of.
     * @param graphWidgetStyle - Controls the visual style of the Graph.
     */
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle

    // Get array of Directions.
    let unsortedDirectionIds: number[] = []
    let directionIds: number[] = []
    let directions: (Direction | null)[] = []
    function getDirectionIdsFromDbModels(dbModels: DirectionDbModel[]) {
        unsortedDirectionIds = dbModels.map(model => Number(model.id))
        const unsortedDirections = getGraphConstructs("Direction", unsortedDirectionIds) as Direction[]
        directions = unsortedDirections.sort(
            (a, b) => (a.directionorder ? a.directionorder : 0) - (b.directionorder ? b.directionorder : 0)
        )
        directionIds = directions.map(direction => direction ? Number(direction.id) : -1)
    }
    $: getDirectionIdsFromDbModels($directionDbModelsStoreAsArray)


    /**
     * Start-drag-Direction method.
     * 
     * Handles mouse-drag operations for reordering Directions.
     * @param event - The mouse-drag event that triggered this method.
     * @param sourceIndex - The index of the Direction that is being dragged.
     */
    const startDragDirection = (event: DragEvent, sourceIndex: number) => {
        // If the event isn't transferring data, abort.
        if (!event.dataTransfer) return

        // Otherwise, set the specified Direction's starting index as the payload.
        event.dataTransfer.effectAllowed = "move"
        event.dataTransfer.dropEffect = "move"
        event.dataTransfer.setData("text/plain", String(sourceIndex))
    }

    /**
     * Drop-Direction method.
     * 
     * Handles drag-release operations for reordering Directions.
     * @param event - The drag-release event that triggered this method.
     * @param destIndex - The index of the Direction that is being hovered over, which will be swapped with the dragged Direction.
     */
    const dropDirection = async (event: DragEvent, destIndex: number) => {
        // If the event isn't transferring data, abort.
        if (!event.dataTransfer) return

        // Retrieve the specified Direction's starting index from the event.
        event.dataTransfer.dropEffect = "move"
        const sourceIndex = parseInt(event.dataTransfer.getData("text/plain"))

        // Get the ID of the specified Direction.
        const directionId = directionIds[sourceIndex]

        // Reorder the Direction arrays to move the specified Direction from the source to
        // the destination index.
        let reorderedDirectionIds = (
            changeIndexInArray(directionIds, sourceIndex, destIndex) as number[]
        )
        directionIds = reorderedDirectionIds
        let reorderedDirections = (
            changeIndexInArray(directions, sourceIndex, destIndex) as Direction[]
        )
        directions = reorderedDirections

        // Update the database and the store.
        await reorderDirection(directionId, destIndex)
        await storeGraphDbModels("Direction")
    }



    let scrollArea: HTMLElement
    
    async function addDirectionForm() {
        await sleep(50) // Prevent the click that called this method from escaping the form.
        directions.push(null)
        directions = directions // Needed for reactivity.
        await tick()
        scrollArea.scrollTo({top: scrollArea.scrollHeight, behavior: "smooth"})
    }

    function removeDirectionForm() {
        directions.pop()
        directions = directions // Needed for reactivity.
    }



</script>


<!-- Directions viewer. -->
<div
    class="directions-viewer"
    class:on-mobile={onMobile()}

    style="background-color: {$uIBackgroundColorStore};"
>
    <!-- List of Directions. -->
    <div
        class="scrollable"
        bind:this={scrollArea}
    >
        {#each directions as direction, index (direction?.id || -index)}
            <div
                draggable={ $readOnlyMode || $directionEditingInProgressIdStore.size ? false : true }
                animate:flip={{ duration: 250 }}

                on:dragstart={ (event) => {if (!$readOnlyMode) startDragDirection(event, index)} }
                on:dragover|preventDefault
                on:drop|preventDefault={ (event) => dropDirection(event, index) }
            >
                <DirectionMenuWidget
                    bind:direction
                    forceExpanded={true}
                    {graph}
                    {graphWidgetStyle}
                    buttonToShow={"edit"}
                    buttonOnWhichSide={"right"}
                    parentScrollArea={scrollArea}
                    {removeDirectionForm}
                />
            </div>
        {/each}
    </div>
</div>

<div
    class="add-direction-button"
    class:on-mobile={onMobile()}

    on:click={addDirectionForm}
    on:keydown={()=>{}}
>
    <strong>+</strong>

    <Tooltip
        text={"Create new Direction."}
        direction={"up"}
        lean={"left"}
    />
</div>


<style>
    .directions-viewer {
        border-radius: 0 0 5px 5px;

        box-sizing: border-box;
        height: 100%;

        display: flex;
        flex-direction: column;
        
        text-align: center;
    }

    .scrollable {
        display: flex;
        flex-direction: column;
        padding: 0.5rem;
        gap: 1rem;

        overflow-x: hidden;
        overflow-y: auto;

        scrollbar-width: thin;
    }

    .directions-viewer.on-mobile .scrollable {
        padding: 0.35rem;
        gap: 0.5rem;
    }


    .add-direction-button {
        border-radius: 5px;

        position: absolute;
        right: 5px;
        top: 5px;
        width: 20px;
        height: 20px;

        background-color: lightgrey;

        text-align: center;
        font-size: 1.07rem;

        cursor: pointer;
    }

    .add-direction-button.on-mobile {
        font-size: 0.93rem;
    }

    .add-direction-button:hover {
        background-color: silver;
    }

    .add-direction-button:active {
        background-color: darkgrey;
    }
  </style>