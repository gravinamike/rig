<script lang="ts">
    // Import types.
    import type { SpaceDbModel } from "$lib/models/dbModels"
    import type { Graph, Space } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"

    // Import SvelteKit framework functions.
    import { tick } from "svelte"
    import { flip } from "svelte/animate"

    // Import stores and utility functions.
    import { spaceDbModelsStoreAsArray, getGraphConstructs, storeGraphDbModels } from "$lib/stores/graphConstructStores"
    import { changeIndexInArray, onMobile } from "$lib/shared/utility"

    // Import related widgets.
    import { Tooltip } from "$lib/widgets/layoutWidgets"
    import { SpaceWidget } from "$lib/widgets/spaceWidgets"

    // Import API methods.
    import { reorderSpace } from "$lib/db"
    import { preventEditing, spaceEditingInProgressIdStore, uIBackgroundColorStore } from "$lib/stores"



    /**
     * @param graph - The Graph that the Directions are part of.
     * @param graphWidgetStyle - Controls the visual style of the Graph.
     * @param setGraphSpace - Method to set the Graph's current Space.
     */
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle
    export let setGraphSpace: (space: Space) => void



    // Get array of Spaces.
    let unsortedSpaceIds: number[] = []
    let spaceIds: number[] = []
    let spaces: (Space | null)[] = []
    function getSpaceIdsFromDbModels(dbModels: SpaceDbModel[]) {
        unsortedSpaceIds = dbModels.map(model => Number(model.id))
        const unsortedSpaces = getGraphConstructs("Space", unsortedSpaceIds) as Space[]
        spaces = unsortedSpaces.sort(
            (a, b) => (a.spaceorder ? a.spaceorder : 0) - (b.spaceorder ? b.spaceorder : 0)
        )
        spaceIds = spaces.map(space => space ? Number(space.id) : -1)
    }
    $: getSpaceIdsFromDbModels($spaceDbModelsStoreAsArray)



    // HTML element handles.
    let scrollArea: HTMLElement


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
        let reorderedSpaces = (
            changeIndexInArray(spaces, sourceIndex, destIndex) as Space[]
        )
        spaces = reorderedSpaces

        // Update the database and the store.
        await reorderSpace(spaceId, destIndex)
        await storeGraphDbModels("Space")
    }

    /**
     * Add-Space form.
     * 
     * Adds a blank Space form to the end of the list of Spaces.
     */
    async function addSpaceForm() {
        // Add a null (representing a blank Space form) to the array of Spaces.
        spaces.push(null)
        spaces = spaces // Needed for reactivity.

        // Scroll to the Space form.
        await tick()
        scrollArea.scrollTo({top: scrollArea.scrollHeight, behavior: "smooth"})
    }
</script>


<!-- Spaces viewer. -->
<div
    class="spaces-viewer"
    class:on-mobile={onMobile()}

    style="background-color: {$uIBackgroundColorStore};"
>
    <!-- List of Spaces. -->
    <div
        class="scrollable"
        bind:this={scrollArea}
    >
        {#each spaces as space, index (space?.id || -1)}
            <!-- Space widget. -->
            <div
                draggable={ $preventEditing || $spaceEditingInProgressIdStore.size ? false : true }
                animate:flip={{ duration: 250 }}

                on:dragstart={ (event) => { if (!$preventEditing) startDragSpace(event, index) } }
                on:dragover|preventDefault
                on:drop|preventDefault={ (event) => dropSpace(event, index) }
            >
                <SpaceWidget
                    bind:space
                    {graph}
                    {graphWidgetStyle}
                    parentScrollArea={scrollArea}
                    {setGraphSpace}
                />
            </div>
        {/each}
    </div>
</div>

<!-- Add-Space button. -->
{#if !$preventEditing}
    <div
        class="add-space-button"
        class:on-mobile={onMobile()}

        on:click={addSpaceForm}
        on:keydown={()=>{}}
    >
        <strong>+</strong>

        <Tooltip
            text={"Create new Space."}
            direction={"up"}
            lean={"left"}
        />
    </div>
{/if}


<style>
    .spaces-viewer {
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

    .spaces-viewer.on-mobile .scrollable {
        padding: 0.35rem;
        gap: 0.5rem;
    }

    .add-space-button {
        border-radius: 5px;

        position: absolute;
        right: 5px;
        top: 5px;
        width: 20px;
        height: 20px;

        background-color: lightgrey;

        text-align: center;
        font-family: "Arial";
        font-size: 1.07rem;

        cursor: pointer;
    }

    .add-space-button.on-mobile {
        font-size: 0.93rem;
    }

    .add-space-button:hover {
        background-color: silver;
    }

    .add-space-button:active {
        background-color: darkgrey;
    }
  </style>