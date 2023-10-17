<script lang="ts">
    // Import types.
    import type { Graph, Thing, ThingCohort } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"

    // Import stores.
    import { reorderingInfoStore } from "$lib/stores"

    // Import related widgets.
    import { RelationshipCohortWidget, ThingCohortWidget } from "$lib/widgets/graphWidgets"

    // Import utility functions.
    import { changeIndexInArray } from "$lib/shared/utility"
    import { tweened } from "svelte/motion";
    import { cubicOut } from "svelte/easing";


    export let thingCohort: ThingCohort
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle
    export let rootThingWidth: number
    export let rootThingHeight: number
    export let perspectiveTexts: {[thingId: string]: string}
    export let parentThingCohortExpanded: boolean
    export let parentCladeOffsetFromCenterOfThingCohort: number
    export let rePerspectToThingId: (id: number) => Promise<void>


    // The array of Thing Cohort members that have Relationships displayed for
    // them starts as the inputted Thing Cohort prop's members, but may change
    // because of Relationship-reordering operations.
    let cohortMembersToDisplay = [...thingCohort.members]

    // If a Relationship-reorder operation is in progress for this Relationship
    // Cohort and a new index has been specified for the target Relationship,
    $: if (
        $reorderingInfoStore.thingCohort === thingCohort
        && $reorderingInfoStore.newIndex !== null
    ) {
        // Reorder the array of Thing Cohort members on which this Relationship
        // Cohort is based.
        const reorderedMembers = changeIndexInArray(///////// Change this function to produce an error instead of void.
            thingCohort.members,
            $reorderingInfoStore.startIndex as number,
            $reorderingInfoStore.newIndex
        )
        if (reorderedMembers) cohortMembersToDisplay = reorderedMembers
    }

    /**
     * Offset to align to Grid.
     * 
     * The offset neccessary to compensate for the offset of the parent Thing to the center of its
     * Thing Cohort, when aligning new Thing Cohorts to a grid.
     */
    $: offsetToAlignToGrid =
        // If...
        (
            // ...the Graph build mode isn't "grid", or the parent Thing or its parent Thing are
            // null...
            (
                graph.pThing?.space?.buildmethod !== "grid"
                || !thingCohort.parentThing
                || !thingCohort.parentThing.parentThingCohort
            )

            // ...or if the parent Thing Cohort isn't expanded...
            || !parentThingCohortExpanded

            // ...or if the parent Thing Cohort's orientation isn't in line with this half-axis,
            || !(
                (
                    [1, 2].includes(thingCohort.halfAxisId)
                    && thingCohort.parentThing.parentThingCohort.rowOrColumn() === "column"
                )
                || (
                    [3, 4].includes(thingCohort.halfAxisId)
                    && thingCohort.parentThing.parentThingCohort.rowOrColumn() === "row"
                )
            )
        ) ?

        // The offset is 0.
        0 :

        // Otherwise, the offset is...
        (
            // ...the offset of the parent Clade from the center of its Thing Cohort...
            parentCladeOffsetFromCenterOfThingCohort

            // ...times -1 if the half-axis is down or right, or 1 if it is up or left.
            * (
                [1, 3].includes(thingCohort.halfAxisId) ? -1 :
                1
            )
        )

    const tweenedOffsetToAlignToGrid = tweened(
        1,
        {duration: 100, easing: cubicOut}
    )
    $: tweenedOffsetToAlignToGrid.set(offsetToAlignToGrid)

    






    let thingCohortExpanded = false


    /**
     * Overlap-margin style text./////////////////////////////
     * 
     * When Things are styled to overlap, the effect is accomplished through CSS
     * margins. This attribute provides the CSS text to style the Thing based
     * on its position in the Thing Cohort and whether the Thing Cohort is
     * arranged in a row or column.
     */
    function getThingOverlapMarginStyleText(
        thing: Thing,
        thingOverlapMargin: number,
        thingCohortRowOrColumn: "row" | "column"
    ) {

        const thingOverlapMarginStyleText =
            // If the root Thing has no parent Cohort or address, (it hasn't yet
            // been built into a Graph), use an empty string (no formatting).
            !thing.parentThingCohort || !thing.address ? "" :

            // If there is only 1 Thing in the Thing Cohort, use an empty string
            // (no formatting).
            thing.parentThingCohort.members.length === 1 ? "" :

            // Else, if the Thing is the first in the Thing Cohort, use only a
            // right or bottom overlap margin.
            thing.address.indexInCohort === 0 ? (
                thingCohortRowOrColumn === "row" ? `margin-right: ${thingOverlapMargin}px;` :
                `margin-bottom: ${thingOverlapMargin}px;`
            ) :

            // Else, if the Thing is the last in the Thing Cohort, use only a left
            // or top overlap margin.
            thing.address.indexInCohort === thing.parentThingCohort.members.length - 1 ? (
                thingCohortRowOrColumn === "row" ? `margin-left: ${thingOverlapMargin}px;` :
                `margin-top: ${thingOverlapMargin}px;`
            ) :

            // Else, use overlap margins on both sides (left/right or top/bottom).
            (
                thingCohortRowOrColumn === "row" ? `margin-left: ${thingOverlapMargin}px; margin-right: ${thingOverlapMargin}px;` :
                `margin-top: ${thingOverlapMargin}px; margin-bottom: ${thingOverlapMargin}px;`
            )

        return thingOverlapMarginStyleText
    }
        
    /**
     * Overlap margin.//////////////////////////////////////////////////////////////
     * 
     * Provides the number of pixels by which the root Thing should overlap its
     * neighbors in the Thing Cohort.
     */
    $: thingOverlapMargin =
        thingCohortExpanded ? graphWidgetStyle.betweenThingOverlap / 2 :
        - graphWidgetStyle.thingSize / 2
    const tweenedThingOverlapMargin = tweened( 1, { duration: 100, easing: cubicOut } )
    $: tweenedThingOverlapMargin.set(thingOverlapMargin)





</script>


<!-- Thing Cohort Widgets. -->
{#if [1, 2, 3, 4, 5, 6, 7, 8].includes(thingCohort.halfAxisId)}
    <ThingCohortWidget
        {thingCohort}
        {cohortMembersToDisplay}
        bind:graph
        {graphWidgetStyle}
        offsetToAlignToGrid={$tweenedOffsetToAlignToGrid}
        bind:perspectiveTexts
        {rePerspectToThingId}

        bind:expanded={thingCohortExpanded}
        {getThingOverlapMarginStyleText}
        thingOverlapMargin={$tweenedThingOverlapMargin}
    />
{/if}

<!-- Relationship Cohort Widgets (only for Cartesian axes). -->
{#if [1, 2, 3, 4].includes(thingCohort.halfAxisId)}
    <RelationshipCohortWidget
        cohort={thingCohort}
        {cohortMembersToDisplay}
        bind:graph
        {graphWidgetStyle}
        thingWidth={rootThingWidth}
        thingHeight={rootThingHeight}
        offsetToAlignToGrid={$tweenedOffsetToAlignToGrid}

        {thingCohortExpanded}
    />
{/if}