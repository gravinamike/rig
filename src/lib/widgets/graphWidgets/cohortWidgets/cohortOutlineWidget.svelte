<script context="module" lang="ts">
    /* Type imports. */
    import type { Graph } from "$lib/models/graphModels"
    import type { ThingCohortWidgetModel } from "$lib/models/widgetModels";

    /* Widget imports */
    import { CladeOutlineWidget, ThingOutlineAlreadyRenderedWidget } from "$lib/widgets/graphWidgets"
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


    $: indexOfGrandparentThing = thingCohortWidgetModel.indexOfGrandparentThing
</script>


<div
    class="cohort-outline-widget"
>
    {#if !(thingCohortWidgetModel.cohort.members.length === 1 && indexOfGrandparentThing !== null && indexOfGrandparentThing !== -1)}<!-- Unless the ONLY descendent in a Half-Axis is a doubled-back parent Thing, -->
        {#each thingCohortWidgetModel.cohort.members as cohortMember}
            {#if "text" in cohortMember}
                <CladeOutlineWidget
                    thingWidgetModel={cohortMember}
                    bind:graph
                    {rePerspectToThingId}
                />
            {:else if thingCohortWidgetModel.cohort.halfAxisId}
                <ThingOutlineAlreadyRenderedWidget
                    thingBaseWidgetModel={cohortMember}
                    cohortHalfAxisId={thingCohortWidgetModel.cohort.halfAxisId}
                    {graph}
                />
            {/if}
        {/each}
    {/if}
</div>


<style>
    .cohort-outline-widget {
        flex: 1 1 auto;

        display: flex;
        flex-direction: column;
        padding: 0.25rem;
        gap: 0.25rem;
    }
</style>