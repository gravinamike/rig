<script lang="ts">
    /* Import types. */
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"
    import type { GenerationMember, Graph, ThingCohort } from "$lib/models/constructModels"

    /* Import widget controller. */
    import ThingCohortWidgetController from "./controller.svelte"

    /* Import widgets. */
    import { ThingMissingFromStoreWidget, ThingAlreadyRenderedWidget, CladeWidget } from "$lib/widgets/graphWidgets"


    /**
     * @param {ThingCohort} thingCohort - The Thing Cohort that the widget is based on.
     * @param {Graph} graph - The Graph that contains the Thing Cohort.
     * @param {GraphWidgetStyle} graphWidgetStyle - Controls the style of the Graph widget.
     * @param {(thingId: number) => Promise<void>} rePerspectToThingId - A function that re-perspects the Graph to a given Thing ID.
     */
    export let thingCohort: ThingCohort
    export let cohortMembersToDisplay: GenerationMember[]
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle
    export let rePerspectToThingId: (thingId: number) => Promise<void>
        
    
    // Attributes managed by the widget controller.
    let xYOffsets: { x: number, y: number } = { x: 0, y: 0 }
    let zIndex: number = 0
    let rowOrColumn: "row" | "column" = "row"
    let indexOfGrandparentThing: number | null = null
    let offsetToGrandparentThingX: number = 0
    let offsetToGrandparentThingY: number = 0
    let showMembers = true
</script>


<!-- Widget controller. -->
<ThingCohortWidgetController
    {thingCohort}
    graphWidgetStyle={graphWidgetStyle}
    planesOffsets={graph.planes.offsets}

    bind:xYOffsets
    bind:zIndex
    bind:rowOrColumn
    bind:indexOfGrandparentThing
    bind:offsetToGrandparentThingX
    bind:offsetToGrandparentThingY
    bind:showMembers
/>


<!-- Thing Cohort Widget. -->
<div
    class="thing-cohort-widget"
    style="
        left: calc({xYOffsets.x}px + 50% + {offsetToGrandparentThingX}px);
        top: calc({xYOffsets.y}px + 50% + {offsetToGrandparentThingY}px);
        z-index: {zIndex};
        flex-direction: {rowOrColumn};
        gap: {
            [5, 6, 7, 8].includes(thingCohort.halfAxisId) ? 4 :
            graphWidgetStyle.betweenThingGap
        }px;
    "
>        

    <!-- Member widgets (either Clade widgets or various Thing-placeholder widgets). -->
    {#if showMembers}

        {#each cohortMembersToDisplay as member}

            <!-- If no Thing was found in the store for the Thing ID, show a Thing Missing From Store Widget. -->
            {#if member.thingId && member.thing === null}
                <ThingMissingFromStoreWidget
                    thingId={member.thingId}
                    {graph}
                    {graphWidgetStyle}
                />

            <!-- Else, if the Thing is already rendered elsewhere in the Graph, show a Thing Already Rendered Widget. -->
            {:else if member.thingId && member.alreadyRendered === true}
                <ThingAlreadyRenderedWidget
                    thingId={member.thingId}
                    cohortHalfAxisId={thingCohort.halfAxisId}
                    {graph}
                    {graphWidgetStyle}
                />

            <!-- Otherwise show a Clade Widget. -->
            {:else if member.thing}
                <CladeWidget
                    rootThing={member.thing}
                    bind:graph
                    {graphWidgetStyle}
                    {cohortMembersToDisplay}
                    {rePerspectToThingId}
                />
            {/if}
            
        {/each}

    {/if}
</div>


<style>
    .thing-cohort-widget {
        position: absolute;
        transform: translate(-50%, -50%);
        
        display: flex;

        pointer-events: none;
    }
</style>