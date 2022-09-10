<script context="module" lang="ts">
    
</script>

<script lang="ts">
    /* Type imports. */
    import type { GraphWidgetModel, ThingWidgetModel } from "$lib/models/widgetModels"
    import ThingCohortWidgetController from "./controller.svelte"

    /* Widget imports */
    import { ThingMissingFromStoreWidget, ThingAlreadyRenderedWidget, CladeWidget } from "$lib/widgets/graphWidgets"


    /**
     * @param  {ThingCohortWidgetModel} thingCohortWidgetModel - The Cohort Widget Model used to set up this Widget.
     * @param  {GraphWidgetModel} graphWidgetModel - The Graph Widget Model that the Cohort is in.
     * @param  {(thingId: number) => Promise<void>} rePerspectToThingId - A function that re-perspects the Graph to a given Thing ID.
     */
    export let thingCohortWidgetModel: ThingCohortWidgetController
    export let parentThingWidgetModel: ThingWidgetModel
    export let graphWidgetModel: GraphWidgetModel
    export let rePerspectToThingId: (thingId: number) => Promise<void>
        

    let xYOffsets: { x: number, y: number }
    let zIndex: number

    let rowOrColumn: "row" | "column"

    let indexOfGrandparentThing: number | null
    let offsetToGrandparentThingX: number
    let offsetToGrandparentThingY: number
</script>



<ThingCohortWidgetController
    thingCohort={thingCohortWidgetModel.thingCohort}
    {parentThingWidgetModel}
    graphWidgetStyle={graphWidgetModel.style}
    planesOffsets={graphWidgetModel.graph.planes.offsets}

    bind:xYOffsets
    bind:zIndex
    bind:rowOrColumn
    bind:indexOfGrandparentThing
    bind:offsetToGrandparentThingX
    bind:offsetToGrandparentThingY
/>



<div
    class="cohort-widget"
    style="
        left: calc({xYOffsets.x}px + 50% + {offsetToGrandparentThingX}px);
        top: calc({xYOffsets.y}px + 50% + {offsetToGrandparentThingY}px);
        z-index: {zIndex};
        flex-direction: {rowOrColumn};
        gap: {thingCohortWidgetModel.cohort.halfAxisId && [5, 6, 7, 8].includes(thingCohortWidgetModel.cohort.halfAxisId) ? 4 : graphWidgetModel.style.betweenThingGap}px;
    "
>        
    {#if !(
        thingCohortWidgetModel.memberModels.length === 1
        && indexOfGrandparentThing !== null
        && indexOfGrandparentThing !== -1
    )}<!-- Unless the ONLY descendent in a Half-Axis is a doubled-back parent Thing, -->

        {#each thingCohortWidgetModel.memberModels as cohortMember}

            {#if cohortMember.kind === "thingMissingFromStoreWidgetModel"}
                <ThingMissingFromStoreWidget
                    model={cohortMember}
                    {graphWidgetModel}
                />
            {:else if cohortMember.kind === "thingAlreadyRenderedWidgetModel"}
                <ThingAlreadyRenderedWidget
                    model={cohortMember}
                    cohortHalfAxisId={thingCohortWidgetModel.cohort.halfAxisId}
                    {graphWidgetModel}
                />
            {:else if cohortMember.kind === "thingWidgetModel"}
                <CladeWidget
                    thingWidgetModel={cohortMember}
                    bind:graphWidgetModel
                    {rePerspectToThingId}
                />
            {/if}
            
        {/each}

    {/if}
</div>


<style>
    .cohort-widget {
        position: absolute;
        transform: translate(-50%, -50%);
        
        display: flex;

        pointer-events: none;
    }
</style>