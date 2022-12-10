<script lang="ts">
    // Import types.
    import type { Direction, Graph } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"

    // Import stores.
    import { directionDbModelsStoreAsArray, getGraphConstructs } from "$lib/stores"

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
</script>


<!-- Directions viewer. -->
<div class="directions-viewer">
    <!-- Title. -->
    <div class="title">
        <h4>Directions</h4>
    </div>

    <!-- List of Directions. -->
    <div class="scrollable">
        {#each directions as direction}
            <DirectionWidget
                {direction}
                {graph}
                {graphWidgetStyle}
            />
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