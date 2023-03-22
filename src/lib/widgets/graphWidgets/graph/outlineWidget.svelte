<script lang="ts">
    // Import types.
    import type { Graph } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"

    // Import stores.
    import { uITrimColorStore } from "$lib/stores"

    // Import related widgets.
    import { ThingCohortOutlineWidget } from "$lib/widgets/graphWidgets"
    

    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle
    export let rePerspectToThingId: (thingId: number) => Promise<void>
</script>


<!-- Graph outline widget. -->
<div
    class="graph-outline-widget"

    style={
        graph.offAxis ? "padding: 0rem;" :
        `background-color: ${$uITrimColorStore}; padding: 0.25rem;`
    }
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
        box-sizing: border-box;
        width: 100%;
        height: 100%;

        overflow-x: hidden;
        overflow-y: auto;
        
        user-select: none;
    }
</style>