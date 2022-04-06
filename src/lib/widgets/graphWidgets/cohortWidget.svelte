<script context="module" lang="ts">
    /* Type imports. */
    import type { Graph } from "$lib/models/graphModels"
    import type { CohortWidgetModel } from "$lib/models/widgetModels";

    /* Widget imports */
    import { CladeWidget, ThingSpacerWidget } from "$lib/widgets/graphWidgets"
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


    $: xYOffsets = cohortWidgetModel.xYOffsets
    $: zIndex = cohortWidgetModel.zIndex

    $: rowOrColumn = cohortWidgetModel.rowOrColumn

    $: indexOfGrandparentThing = cohortWidgetModel.indexOfGrandparentThing
    $: offsetToGrandparentThingX = cohortWidgetModel.offsetToGrandparentThingX
    $: offsetToGrandparentThingY = cohortWidgetModel.offsetToGrandparentThingY
</script>


<main
    class="cohort-widget"
    style="
        left: calc({xYOffsets.x}px + 50% + {offsetToGrandparentThingX}px);
        top: calc({xYOffsets.y}px + 50% + {offsetToGrandparentThingY}px);
        z-index: {zIndex};
        flex-direction: {rowOrColumn};
        gap: {[5, 6, 7, 8].includes(cohortWidgetModel.cohort.address.halfAxisId) ? 4 : graph.graphWidgetStyle.betweenThingGap}px;
    "
>
    {#if !(cohortWidgetModel.cohort.members.length === 1 && indexOfGrandparentThing !== null && indexOfGrandparentThing !== -1)}<!-- Unless the ONLY descendent in a Half-Axis is a doubled-back parent Thing, -->
        {#each cohortWidgetModel.cohort.members as cohortMember}
            {#if "text" in cohortMember}
                <CladeWidget
                    thingWidgetModel={cohortMember}
                    bind:graph
                    {rePerspectToThingId}
                />
            {:else}
                <ThingSpacerWidget
                    thingBaseWidgetModel={cohortMember}
                    cohortHalfAxisId={cohortWidgetModel.cohort.address.halfAxisId}
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