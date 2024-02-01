<script lang="ts">
    // Import types.
    import type { Graph } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"

    // Import stores.
    import { uITrimColorStore } from "$lib/stores"

    // Import related widgets.
    import { ThingCohortOutlineWidget } from "$lib/widgets/graphWidgets"
    


    /**
     * @param graph - The Graph that the widget is based on.
     * @param graphWidgetStyle - Controls the style of the widget.
     * @param rePerspectToThingId - Method to re-Perspect the Graph to a new Thing ID.
     */
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle
    export let rePerspectToThingId: (thingId: number) => Promise<void>
</script>


<!-- Graph outline widget. -->
<div
    class="graph-outline-widget"
    class:off-axis={graph.offAxis}

    style={graph.offAxis ? "" : `background-color: ${$uITrimColorStore};`}
>
    <!-- Root Thing Cohort Widget (from which the rest of the Graph Outline automatically "grows"). -->
    {#if graph.rootCohort}
        <ThingCohortOutlineWidget
            thingCohort={graph.rootCohort}
            {graph}
            {graphWidgetStyle}
            {rePerspectToThingId}
        />
    {/if}
</div>


<style>
    .graph-outline-widget {
        box-sizing: border-box;
        width: 100%;
        height: 100%;

        padding: 0.25rem;

        overflow-x: hidden;
        overflow-y: auto;
        
        user-select: none;
    }

    .graph-outline-widget.off-axis {
        padding: 0rem;
    }
</style>