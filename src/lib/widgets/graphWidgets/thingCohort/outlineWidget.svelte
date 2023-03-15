<script lang="ts">
    import type { Graph, ThingCohort } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"

    import { CladeOutlineWidget, ThingOutlineAlreadyRenderedWidget } from "$lib/widgets/graphWidgets"

    
    /**
     * @param {ThingCohort} thingCohort - The Thing Cohort used to set up this Widget.
     * @param {Graph} graph - The Graph that the Cohort is in.
     * @param {GraphWidgetStyle} graphWidgetStyle - Controls the visual styling of the Graph.
     * @param {(thingId: number) => Promise<void>} rePerspectToThingId - A function that re-perspects the Graph to a given Thing ID.
     */
    export let thingCohort: ThingCohort
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle
    export let rePerspectToThingId: (thingId: number) => Promise<void>


    // Attributes related to whether the Thing Cohort is "doubled back"
    // (meaning the ONLY descendent in the Half-Axis is the Thing
    // Cohort's own parent Thing).
    $: indexOfGrandparentThing = thingCohort.indexOfGrandparentThing
    $: onlyDescendantIsDoubledBack = (
        thingCohort.members.length === 1
        && indexOfGrandparentThing !== null
        && indexOfGrandparentThing !== -1
    )
</script>


<div class="cohort-outline-widget">
    {#if !onlyDescendantIsDoubledBack}
        {#each thingCohort.members as cohortMember}

            <!-- If the Thing already exists in the Graph, render an already-rendered widget. -->
            {#if cohortMember.alreadyRendered && cohortMember.thingId}
                <ThingOutlineAlreadyRenderedWidget
                    thingId={cohortMember.thingId}
                    cohortHalfAxisId={thingCohort.halfAxisId}
                    {graph}
                    {graphWidgetStyle}
                />

            <!-- Else render a Clade outline widget with the Thing as its root. -->
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