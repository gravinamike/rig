<script lang="ts">
    import type { Graph } from "$lib/models/constructModels"

    // Import widgets.
    import { ThingCohortOutlineWidget } from "$lib/widgets/graphWidgets"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"
    
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle
    export let rePerspectToThingId: (thingId: number) => Promise<void>


    // Configure style for off-axis styling, if applicable.
    if (graph.offAxis) {
        graphWidgetStyle.excludePerspectiveThing = true
        graphWidgetStyle.excludeCartesianAxes = true
    }
</script>


<div
    class="graph-outline-widget"
>
    <!-- Root Cohort Widget (from which the rest of the Graph Outline automatically "grows"). -->
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
        outline: solid 1px lightgrey;
        outline-offset: -1px;

        box-sizing: border-box;
        width: 100%;
        height: 100%;

        padding: 0.25rem;

        overflow-x: hidden;
        overflow-y: auto;
        
        user-select: none;
    }
</style>