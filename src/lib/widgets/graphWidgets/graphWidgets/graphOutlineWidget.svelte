<script lang="ts">
    // Import types.
    import type { Graph } from "$lib/models/graphModels"

    // Import widgets.
    import { CohortOutlineWidget } from "$lib/widgets/graphWidgets"
    
    export let graph: Graph
    export let rePerspectToThingId: (thingId: number) => Promise<void>
</script>


<div
    class="graph-outline-widget"
>
    <!-- Root Cohort Widget (from which the rest of the Graph Outline automatically "grows"). -->
    {#if graph.rootCohortWidgetModel}
        <CohortOutlineWidget
            cohortWidgetModel={graph.rootCohortWidgetModel}
            bind:graph
            {rePerspectToThingId}
        />
    {/if}
</div>


<style>
    .graph-outline-widget {
        outline: solid 1px lightgrey;
        outline-offset: -1px;

        box-sizing: border-box;
        width: 750px;
        height: 100%;
        background-color: #fafafa;

        padding: 0.25rem;

        overflow: scroll;
        
        user-select: none;
    }
</style>