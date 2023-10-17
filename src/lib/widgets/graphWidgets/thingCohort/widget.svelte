<script lang="ts">
    /* Import types. */
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"
    import type { GenerationMember, Graph, Thing, ThingCohort } from "$lib/models/constructModels"

    /* Import widget controller. */
    import ThingCohortWidgetController from "./controller.svelte"

    /* Import widgets. */
    import { ThingMissingFromStoreWidget, ThingAlreadyRenderedWidget, CladeWidget } from "$lib/widgets/graphWidgets"
    import { tweened } from "svelte/motion";
    import { cubicOut } from "svelte/easing";


    /**
     * @param thingCohort - The Thing Cohort that the widget is based on.
     * @param graph - The Graph that contains the Thing Cohort.
     * @param graphWidgetStyle - Controls the style of the Graph widget.
     * @param offsetToAlignToGrid - The offset, in pixels, needed to align the Relationships to the grid (if in use).
     * @param rePerspectToThingId - A function that re-perspects the Graph to a given Thing ID.
     */
    export let thingCohort: ThingCohort
    export let cohortMembersToDisplay: GenerationMember[]
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle
    export let offsetToAlignToGrid = 0
    export let perspectiveTexts: {[thingId: string]: string}
    export let rePerspectToThingId: (thingId: number) => Promise<void>   
        
    export let expanded = false
    export let getThingOverlapMarginStyleText: (
        thing: Thing,
        thingOverlapMargin: number,
        thingCohortRowOrColumn: "row" | "column"
    ) => string = () => ""
    export let thingOverlapMargin: number = 0


    
    // Attributes managed by the widget controller.
    let xYOffsets: { x: number, y: number } = { x: 0, y: 0 }
    let zIndex: number = 0
    let rowOrColumn: "row" | "column" = "row"
    let indexOfGrandparentThing: number | null = null
    let offsetToGrandparentThingX: number = 0
    let offsetToGrandparentThingY: number = 0
    let showMembers = true


    ///////////// MOVE INTO CONTROLLER
    $: sizeAlongLongAxis =
        expanded ? (
            thingCohort.members.length * graphWidgetStyle.thingSize
            + (thingCohort.members.length - 1) * graphWidgetStyle.betweenThingSpacing
        ) :
        graphWidgetStyle.thingSize
    const tweenedSizeAlongLongAxis = tweened( 1, { duration: 100, easing: cubicOut } )
    $: tweenedSizeAlongLongAxis.set(sizeAlongLongAxis)   



    $: widgetWidthMinusBorder =
        thingCohort.rowOrColumn() === "row" ? $tweenedSizeAlongLongAxis :
        graphWidgetStyle.thingSize
        
    $: widgetHeightMinusBorder =
        thingCohort.rowOrColumn() === "column" ? $tweenedSizeAlongLongAxis :
        graphWidgetStyle.thingSize


    

    function toggleExpanded() {
        expanded = !expanded
    }









    $: gap =
        [5, 6, 7, 8].includes(thingCohort.halfAxisId) ? 4 :
        expanded ? graphWidgetStyle.betweenThingGap:
        0
    const tweenedGap = tweened( 1, { duration: 100, easing: cubicOut } )
    $: tweenedGap.set(gap)   



    








</script>


<!-- Widget controller. -->
<ThingCohortWidgetController
    {thingCohort}
    graphWidgetStyle={graphWidgetStyle}
    planesOffsets={graph.planes.offsets}
    {offsetToAlignToGrid}
    
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
        gap: {gap}px;
    "
>
    {#if showMembers && cohortMembersToDisplay.length > 1}
        <div
            class="thing-cohort-border"

            style="
                width: {widgetWidthMinusBorder + 50}px;
                height: {widgetHeightMinusBorder + 50}px;
            "

            on:click={toggleExpanded}
            on:keydown={()=>{}}
        />
    {/if}



    <!-- Member widgets (either Clade widgets or various Thing-placeholder widgets). -->
    {#if showMembers}

        {#each cohortMembersToDisplay as member}

            <!-- If no Thing was found in the store for the Thing ID, show a Thing Missing From Store Widget. -->
            {#if member.thingId && !member.thing?.id}
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
                    {getThingOverlapMarginStyleText}
                    {thingOverlapMargin}
                    thingCohortRowOrColumn={rowOrColumn}
                />

            <!-- Otherwise show a Clade Widget. -->
            {:else if member.thing}
                <CladeWidget
                    rootThing={member.thing}
                    bind:graph
                    {graphWidgetStyle}
                    bind:perspectiveTexts
                    rootThingThingCohortMembers={cohortMembersToDisplay}
                    {rePerspectToThingId}
                    {getThingOverlapMarginStyleText}
                    {thingOverlapMargin}
                    thingCohortRowOrColumn={rowOrColumn}
                    rootThingThingCohortExpanded={expanded}
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

    .thing-cohort-border {
        border-radius: 10px;

        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        opacity: 33%;

        pointer-events: auto;
        cursor: default;
    }


    .thing-cohort-border:hover {
        outline: dashed 2px grey;
    }

</style>