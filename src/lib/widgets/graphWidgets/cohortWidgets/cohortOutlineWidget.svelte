<script context="module" lang="ts">
    /* Type imports. */
    import type { Graph } from "$lib/models/graphModels"
    import type { CohortWidgetModel } from "$lib/models/widgetModels";

    /* Widget imports */
    import { CladeOutlineWidget, ThingOutlineAlreadyRenderedWidget } from "$lib/widgets/graphWidgets"
</script>

<script lang="ts">
    /**
     * @param  {CohortWidgetModel} cohortWidgetModel - The Cohort Widget Model used to set up this Widget.
     * @param  {Graph} graph - The Graph that the Cohort is in.
     * @param  {(thingId: number) => Promise<void>} rePerspectToThingId - A function that re-perspects the Graph to a given Thing ID.
     */
    export let cohortWidgetModel: CohortWidgetModel
    export let graph: Graph
    export let rePerspectToThingId: (thingId: number) => Promise<void>


    $: indexOfGrandparentThing = cohortWidgetModel.indexOfGrandparentThing
</script>


<div
    class="cohort-outline-widget"
>
    {#if !(cohortWidgetModel.cohort.members.length === 1 && indexOfGrandparentThing !== null && indexOfGrandparentThing !== -1)}<!-- Unless the ONLY descendent in a Half-Axis is a doubled-back parent Thing, -->
        {#each cohortWidgetModel.cohort.members as cohortMember}
            {#if "text" in cohortMember}
                <CladeOutlineWidget
                    thingWidgetModel={cohortMember}
                    bind:graph
                    {rePerspectToThingId}
                />
            {:else}
                <ThingOutlineAlreadyRenderedWidget
                    thingBaseWidgetModel={cohortMember}
                    cohortHalfAxisId={cohortWidgetModel.cohort.address.halfAxisId}
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

        pointer-events: none;
    }
</style>