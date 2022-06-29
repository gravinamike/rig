<script context="module" lang="ts">
    /* Type imports. */
    import type { Graph } from "$lib/models/graphModels"
    import type { ThingCohortWidgetModel } from "$lib/models/widgetModels";

    /* Widget imports */
    import { CladeWidget, ThingAlreadyRenderedWidget } from "$lib/widgets/graphWidgets"
</script>

<script lang="ts">
    /**
     * @param  {ThingCohortWidgetModel} thingCohortWidgetModel - The Cohort Widget Model used to set up this Widget.
     * @param  {Graph} graph - The Graph that the Cohort is in.
     * @param  {(thingId: number) => Promise<void>} rePerspectToThingId - A function that re-perspects the Graph to a given Thing ID.
     */
    export let thingCohortWidgetModel: ThingCohortWidgetModel
    export let graph: Graph
    export let rePerspectToThingId: (thingId: number) => Promise<void>
        

    $: xYOffsets = thingCohortWidgetModel.xYOffsets
    $: zIndex = thingCohortWidgetModel.zIndex

    $: rowOrColumn = thingCohortWidgetModel.rowOrColumn

    $: indexOfGrandparentThing = thingCohortWidgetModel.indexOfGrandparentThing
    $: offsetToGrandparentThingX = thingCohortWidgetModel.offsetToGrandparentThingX
    $: offsetToGrandparentThingY = thingCohortWidgetModel.offsetToGrandparentThingY
</script>


<main
    class="cohort-widget"
    style="
        left: calc({xYOffsets.x}px + 50% + {offsetToGrandparentThingX}px);
        top: calc({xYOffsets.y}px + 50% + {offsetToGrandparentThingY}px);
        z-index: {zIndex};
        flex-direction: {rowOrColumn};
        gap: {thingCohortWidgetModel.cohort.halfAxisId && [5, 6, 7, 8].includes(thingCohortWidgetModel.cohort.halfAxisId) ? 4 : graph.graphWidgetStyle.betweenThingGap}px;
    "
>        
    {#if !(thingCohortWidgetModel.cohort.members.length === 1 && indexOfGrandparentThing !== null && indexOfGrandparentThing !== -1)}<!-- Unless the ONLY descendent in a Half-Axis is a doubled-back parent Thing, -->
        {#each thingCohortWidgetModel.cohort.members as cohortMember}
            {#if "text" in cohortMember}
                <CladeWidget
                    thingWidgetModel={cohortMember}
                    bind:graph
                    {rePerspectToThingId}
                />
            {:else if thingCohortWidgetModel.cohort.halfAxisId}
                <ThingAlreadyRenderedWidget
                    thingBaseWidgetModel={cohortMember}
                    cohortHalfAxisId={thingCohortWidgetModel.cohort.halfAxisId}
                    {graph}
                />
            {/if}
        {/each}
    {/if}
</main>


<style>
    main {
        position: absolute;
        transform: translate(-50%, -50%);
        
        display: flex;

        pointer-events: none;
    }
</style>