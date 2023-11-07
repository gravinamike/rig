<script lang="ts">
    /* Import types. */
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"
    import type { GenerationMember, Graph, Thing, ThingCohort } from "$lib/models/constructModels"

    /* Import widget controller. */
    import ThingCohortWidgetController from "./controller.svelte"

    /* Import widgets. */
    import { ThingMissingFromStoreWidget, ThingAlreadyRenderedWidget, CladeWidget } from "$lib/widgets/graphWidgets"

    

    /**
     * @param thingCohort - The Thing Cohort that the widget is based on.
     * @param graph - The Graph that contains the Thing Cohort.
     * @param graphWidgetStyle - Controls the style of the Graph widget.
     * @param offsetToAlignToGrid - The offset, in pixels, needed to align the Relationships to the grid (if in use).
     * @param perspectiveTexts - Array of perspective-specific texts for the Things in the Thing Cohort.
     * @param rePerspectToThingId - A function that re-perspects the Graph to a given Thing ID.
     * @param expanded - Whether the Thing Cohort is expanded or collapsed.
     * @param thingOverlapMargin - The amount to overlap sibling Things in the Thing Cohort if the percent overlap is negative.
     * @param getThingOverlapMarginStyleText - Function to get the style text to implement the desired overlap margin.
     */
    export let thingCohort: ThingCohort
    export let thingCohortMembersToDisplay: GenerationMember[] = []
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle
    export let offsetToAlignToGrid = 0
    export let perspectiveTexts: {[thingId: string]: string}
    export let rePerspectToThingId: (thingId: number) => Promise<void>
    export let expanded = false
    export let thingOverlapMargin: number = 0
    export let getThingOverlapMarginStyleText: (
        thing: Thing,
        thingOverlapMargin: number,
        thingCohortRowOrColumn: "row" | "column"
    ) => string = () => ""
    

    
    // Attributes managed by the widget controller.
    let xYOffsets: { x: number, y: number } = { x: 0, y: 0 }
    let zIndex: number = 0
    let rowOrColumn: "row" | "column" = "row"
    let gap: number = 0
    let indexOfGrandparentThing: number | null = null
    let offsetToGrandparentThingX: number = 0
    let offsetToGrandparentThingY: number = 0
    let widgetWidthMinusBorder = 1
    let widgetHeightMinusBorder = 1
    let showMembers = true


    // Lock-expanded flag (determines whether the Thing Cohort is locked in the "expanded"
    // configuration).
    let lockExpanded = false

    // Index of the Thing Cohort member that is brought to the top or front of the stacking order
    // (by hovering over it).
    let memberOnTopIndex = 0
</script>


<!-- Widget controller. -->
<ThingCohortWidgetController
    {thingCohort}
    graphWidgetStyle={graphWidgetStyle}
    planesOffsets={graph.planes.offsets}
    {offsetToAlignToGrid}
    {expanded}
    
    bind:xYOffsets
    bind:zIndex
    bind:rowOrColumn
    bind:gap
    bind:indexOfGrandparentThing
    bind:offsetToGrandparentThingX
    bind:offsetToGrandparentThingY
    bind:widgetWidthMinusBorder
    bind:widgetHeightMinusBorder
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

    on:mouseenter={() => {
        if (!lockExpanded) expanded = true
    }}
    on:mouseleave={() => {
        if (!lockExpanded) expanded = false
    }}
    on:keydown={()=>{}}
>
    <!-- Thing Cohort bounding border. -->
    {#if showMembers && thingCohortMembersToDisplay.length > 1}

        <div
            class="thing-cohort-border"

            style="
                width: {widgetWidthMinusBorder + 50}px;
                height: {widgetHeightMinusBorder + 50}px;
            "

            on:click={() => {
                if (!lockExpanded) {
                    expanded = true
                    lockExpanded = true
                } else {
                    expanded = false
                    lockExpanded = false
                }
            }}
            on:keydown={()=>{}}
        />

    {/if}

    <!-- Member widgets (either Clade widgets or various Thing-placeholder widgets). -->
    {#if showMembers}

        {#each thingCohortMembersToDisplay as member}

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
                    rootThingThingCohortMembers={thingCohortMembersToDisplay}
                    rootThingThingCohortExpanded={expanded}
                    {thingOverlapMargin}
                    parentThingCohortRowOrColumn={rowOrColumn}
                    bind:parentThingCohortMemberOnTopIndex={memberOnTopIndex}
                    {rePerspectToThingId}
                    {getThingOverlapMarginStyleText}
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
        border-radius: 16px;

        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        opacity: 33%;

        pointer-events: auto;
        cursor: default;
    }

    .thing-cohort-border:hover {
        border: dashed 2px grey;
    }
</style>