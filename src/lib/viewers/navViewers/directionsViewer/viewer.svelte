<script lang="ts">
    // Import types.
    import type { Direction, Graph } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"

    // Import framework functions.
    import { flip } from "svelte/animate"

    // Import stores and utility functions.
    import { directionDbModelsStoreAsArray, getGraphConstructs } from "$lib/stores"
    import { changeIndexInArray } from "$lib/shared/utility"

    // Import related widgets.
    import { DirectionWidget } from "$lib/widgets/spaceWidgets"


    /**
     * @param graph - The Graph that the Directions are part of.
     * @param graphWidgetStyle - Controls the visual style of the Graph.
     */
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle


    // Get array of Directions.
    $: directionIds = $directionDbModelsStoreAsArray.map(model => Number(model.id))
    $: directions = getGraphConstructs("Direction", directionIds) as Direction[]








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
    const dropDirection = (event: DragEvent, destIndex: number) => {
        // If the event isn't transferring data, abort.
        if (!event.dataTransfer) return

        // Retrieve the specified Direction's starting index from the event.
        event.dataTransfer.dropEffect = "move"
        const sourceIndex = parseInt(event.dataTransfer.getData("text/plain"))

        // Reorder the Direction IDs array to move the specified Direction ID from the source to
        // the destination index.
        let reorderedDirectionIds = (
            changeIndexInArray(directionIds, sourceIndex, destIndex) as number[]
        )
        directionIds = reorderedDirectionIds

        // Update the store and the config file.
        /////////////////////////// CREATE A SETDIRECTIONSORDER METHOD HERE.
    }


</script>


<!-- Directions viewer. -->
<div class="directions-viewer">
    <!-- Title. -->
    <div class="title">
        <h4>Directions</h4>
    </div>

    <!-- List of Directions. -->
    <div class="scrollable">
        {#each directions as direction, index (direction.id)}
            <div
                draggable=true
                animate:flip={{ duration: 250 }}

                on:dragstart={ (event) => startDragDirection(event, index) }
                on:dragover|preventDefault
                on:drop|preventDefault={ (event) => dropDirection(event, index) }
            >
                <DirectionWidget
                    {direction}
                    {graph}
                    {graphWidgetStyle}
                />
            </div>
        {/each}
    </div>
</div>


<style>
    .directions-viewer {
        outline: solid 1px lightgrey;
        outline-offset: -1px;

        box-sizing: border-box;
        height: 100%;
        background-color: #fafafa;

        display: flex;
        flex-direction: column;
        
        text-align: center;
    }

    .title {
        display: flex;
        flex-direction: column;
        padding: 1rem 0 0.5rem 0;
        gap: 1rem;
    }

    h4 {
        margin: 0;
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
  </style>