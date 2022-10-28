<script lang="ts">
    import type { Graph, ThingCohort } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"
    import { CladeOutlineWidget, ThingOutlineAlreadyRenderedWidget } from "$lib/widgets/graphWidgets"

    /**
     * @param  {ThingCohort} thingCohort - The Thing Cohort used to set up this Widget.
     * @param  {Graph} graph - The Graph that the Cohort is in.
     * @param  {(thingId: number) => Promise<void>} rePerspectToThingId - A function that re-perspects the Graph to a given Thing ID.
     */
    export let thingCohort: ThingCohort
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle
    export let rePerspectToThingId: (thingId: number) => Promise<void>


    $: indexOfGrandparentThing = thingCohort.indexOfGrandparentThing
</script>


<div
    class="cohort-outline-widget"
>
    {#if !(thingCohort.members.length === 1 && indexOfGrandparentThing !== null && indexOfGrandparentThing !== -1)}<!-- Unless the ONLY descendent in a Half-Axis is a doubled-back parent Thing, -->
        {#each thingCohort.members as cohortMember}
            {#if cohortMember.alreadyRendered && cohortMember.thingId}
                <ThingOutlineAlreadyRenderedWidget
                    thingId={cohortMember.thingId}
                    cohortHalfAxisId={thingCohort.halfAxisId}
                    {graph}
                    {graphWidgetStyle}
                />
            {:else if cohortMember.thing}
                <CladeOutlineWidget
                    rootThing={cohortMember.thing}
                    {graph}
                    {graphWidgetStyle}
                    {rePerspectToThingId}
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