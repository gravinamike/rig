<script lang="ts">
    // Import types.
    import type { Graph, Space } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"
    import type { SpaceDbModel } from "$lib/models/dbModels/clientSide"

    // Import framework functions.
    import { flip } from "svelte/animate"

    // Import stores and utility functions.
    import { spaceDbModelsStoreAsArray, getGraphConstructs, storeGraphDbModels } from "$lib/stores/graphConstructStores"
    import { changeIndexInArray } from "$lib/shared/utility"

    // Import related widgets.
    import { SpaceWidget } from "$lib/widgets/spaceWidgets"

    // Import API methods.
    import { reorderSpace } from "$lib/db/clientSide"
    import { readOnlyMode } from "$lib/stores";


    /**
     * @param graph - The Graph that the Directions are part of.
     * @param graphWidgetStyle - Controls the visual style of the Graph.
     * @param useTabbedLayout - Whether to use full or tabbed layout for side menus.
     * @param setGraphSpace - Method to set the Graph's current Space.
     */
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle
    export let useTabbedLayout: boolean    
    export let setGraphSpace: (space: Space) => void


    // Get array of Spaces.
    let unsortedSpaceIds: number[] = []
    let spaceIds: number[] = []
    let spaces: Space[] = []
    function getSpaceIdsFromDbModels(dbModels: SpaceDbModel[]) {
        unsortedSpaceIds = dbModels.map(model => Number(model.id))
        const unsortedSpaces = getGraphConstructs("Space", unsortedSpaceIds) as Space[]
        spaces = unsortedSpaces.sort(
            (a, b) => (a.spaceorder ? a.spaceorder : 0) - (b.spaceorder ? b.spaceorder : 0)
        )
        spaceIds = spaces.map(space => Number(space.id))
    }
    getSpaceIdsFromDbModels($spaceDbModelsStoreAsArray)






    /**
     * Start-drag-Space method.
     * 
     * Handles mouse-drag operations for reordering Spaces.
     * @param event - The mouse-drag event that triggered this method.
     * @param sourceIndex - The index of the Space that is being dragged.
     */
     const startDragSpace = (event: DragEvent, sourceIndex: number) => {
        // If the event isn't transferring data, abort.
        if (!event.dataTransfer) return

        // Otherwise, set the specified Space's starting index as the payload.
        event.dataTransfer.effectAllowed = "move"
        event.dataTransfer.dropEffect = "move"
        event.dataTransfer.setData("text/plain", String(sourceIndex))
    }

    /**
     * Drop-Space method.
     * 
     * Handles drag-release operations for reordering Spaces.
     * @param event - The drag-release event that triggered this method.
     * @param destIndex - The index of the Space that is being hovered over, which will be swapped with the dragged Space.
     */
    const dropSpace = async (event: DragEvent, destIndex: number) => {
        // If the event isn't transferring data, abort.
        if (!event.dataTransfer) return

        // Retrieve the specified Space's starting index from the event.
        event.dataTransfer.dropEffect = "move"
        const sourceIndex = parseInt(event.dataTransfer.getData("text/plain"))

        // Get the ID of the specified Space.
        const spaceId = spaceIds[sourceIndex]

        // Reorder the Space IDs array to move the specified Space ID from the source to
        // the destination index.
        let reorderedDirectionIds = (
            changeIndexInArray(spaceIds, sourceIndex, destIndex) as number[]
        )
        spaceIds = reorderedDirectionIds
        let reorderedDirections = (
            changeIndexInArray(spaces, sourceIndex, destIndex) as Space[]
        )
        spaces = reorderedDirections

        // Update the database and the store.
        await reorderSpace(spaceId, destIndex)
        await storeGraphDbModels("Space")
    }
</script>


<!-- Spaces viewer. -->
<div
    class="spaces-viewer"
>
    {#if !useTabbedLayout}
        <!-- Title. -->
        <div class="title">
            <h4>Spaces</h4>
        </div>
    {/if}

    <!-- List of Spaces. -->
    <div class="scrollable">
        {#each spaces as space, index (space.id)}
            <div
                draggable={ $readOnlyMode ? false : true }
                animate:flip={{ duration: 250 }}

                on:dragstart={ (event) => { if (!$readOnlyMode) startDragSpace(event, index) } }
                on:dragover|preventDefault
                on:drop|preventDefault={ (event) => dropSpace(event, index) }
            >
                <SpaceWidget
                    {space}
                    {graph}
                    {graphWidgetStyle}
                    {setGraphSpace}
                />
            </div> 
        {/each}
    </div>
</div>


<style>
    .spaces-viewer {
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