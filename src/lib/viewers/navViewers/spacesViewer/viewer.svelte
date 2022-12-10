<script lang="ts">
    // Import types.
    import type { Graph, Space } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"

    // Import stores.
    import { spaceDbModelsStoreAsArray, getGraphConstructs } from "$lib/stores/graphConstructStores"

    // Import related widgets.
    import { SpaceWidget } from "$lib/widgets/spaceWidgets"


    /**
     * @param graph - The Graph that the Directions are part of.
     * @param graphWidgetStyle - Controls the visual style of the Graph.
     * @param setGraphSpace - Method to set the Graph's current Space.
     */
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle
    export let setGraphSpace: (space: Space) => void


    // Get array of Spaces.
    $: spaceIds = $spaceDbModelsStoreAsArray.map(model => Number(model.id))
    $: spaces = getGraphConstructs("Space", spaceIds) as Space[]
</script>


<!-- Spaces viewer. -->
<div class="spaces-viewer">
    <!-- Title. -->
    <div class="title">
        <h4>Spaces</h4>
    </div>

    <!-- List of Spaces. -->
    <div class="scrollable">
        {#each spaces as space}
            <SpaceWidget
                {space}
                {graph}
                {graphWidgetStyle}
                {setGraphSpace}
            />
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