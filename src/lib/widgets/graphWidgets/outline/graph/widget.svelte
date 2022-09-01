<script lang="ts">
    // Import types.
    import type { GraphWidgetModel } from "$lib/models/widgetModels";

    // Import widgets.
    import { ThingCohortOutlineWidget } from "$lib/widgets/graphWidgets"
    
    export let graphWidgetModel: GraphWidgetModel
    export let rePerspectToThingId: (thingId: number) => Promise<void>
</script>


<div
    class="graph-outline-widget"
>
    <!-- Root Cohort Widget (from which the rest of the Graph Outline automatically "grows"). -->
    {#if graphWidgetModel.rootThingCohortWidgetModel}
        <ThingCohortOutlineWidget
            thingCohortWidgetModel={graphWidgetModel.rootThingCohortWidgetModel}
            bind:graphWidgetModel
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