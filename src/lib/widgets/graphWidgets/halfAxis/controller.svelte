<script lang="ts">
    // Import types.
    import type { Tweened } from "svelte/motion"
    import type { Graph, ThingCohort, GenerationMember, Thing } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "../graph"

    // Import basic SvelteKit framework resources.
    import { tweened } from "svelte/motion"
    import { cubicOut } from "svelte/easing"
    
    // Import stores.
    import { reorderingInfoStore } from "$lib/stores"

    // Import utility functions.
    import { changeIndexInArray } from "$lib/shared/utility"



    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle
    export let parentThingCohortExpanded: boolean
    export let parentCladeOffsetFromCenterOfThingCohort: number
    export let thingCohort: ThingCohort

    export let thingCohortMembersToDisplay: GenerationMember[]
    export let tweenedOffsetToAlignToGrid: Tweened<number>
    export let thingCohortExpanded = graph.pThing?.space?.buildmethod === "grid" ? false : true
    export let tweenedThingOverlapMargin: Tweened<number>
    export let getThingOverlapMarginStyleText: (
        thing: Thing,
        thingOverlapMargin: number,
        thingCohortRowOrColumn: "row" | "column"
    ) => string


    
    /* --------------- Output attributes. --------------- */
    
    /**
     * Thing-Cohort-members to display.
     * 
     * The array of Thing Cohort members that have Relationships displayed for
     * them starts as the inputted Thing Cohort prop's members, but may change
     * because of Relationship-reordering operations.
     */
    thingCohortMembersToDisplay = [...thingCohort.members]

    /**
     * Tweened offset to align to grid.
     * 
     * The offset neccessary to compensate for the offset of the parent Thing to the center of its
     * Thing Cohort, when aligning new Thing Cohorts to a grid. Tweened for animation.
     */
    tweenedOffsetToAlignToGrid = tweened( 1, { duration: 100, easing: cubicOut } )
    $: tweenedOffsetToAlignToGrid.set(offsetToAlignToGrid)

    /**
     * Tweened Thing overlap margin.
     * 
     * Provides the number of pixels by which the root Thing should overlap its neighbor siblings
     * in its Thing Cohort. Tweened for animation.
     */
    tweenedThingOverlapMargin = tweened( 1, { duration: 100, easing: cubicOut } )
    $: tweenedThingOverlapMargin.set(thingOverlapMargin)

    /**
     * Get-overlap-margin style text method.
     * 
     * When Things are styled to overlap, the effect is accomplished through CSS margins. This
     * method provides the CSS text to style a Thing based on its position in the Thing Cohort and
     * whether the Thing Cohort is arranged in a row or column.
     * @param thing - The Thing to style.
     * @param thingOverlapMargin - The desired overlap margin between Things, in pixels.
     * @param thingCohortRowOrColumn - Whether the Thing Cohort the Thing belongs to is arranged as a row or column.
     */
    getThingOverlapMarginStyleText = (
        thing: Thing,
        thingOverlapMargin: number,
        thingCohortRowOrColumn: "row" | "column"
    ) => {
        // Construct the Thing overlap-margin style text string.
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

        // Return the Thing overlap-margin style text string.
        return thingOverlapMarginStyleText
    }


    /* --------------- Support attributes. --------------- */


    // If a Relationship-reorder operation is in progress for this Relationship
    // Cohort and a new index has been specified for the target Relationship,
    $: if (
        $reorderingInfoStore.thingCohort === thingCohort
        && $reorderingInfoStore.newIndex !== null
    ) {
        // Reorder the array of Thing Cohort members on which this Relationship
        // Cohort is based.
        const reorderedMembers = changeIndexInArray(
            thingCohort.members,
            $reorderingInfoStore.startIndex as number,
            $reorderingInfoStore.newIndex
        )
        if (reorderedMembers) thingCohortMembersToDisplay = reorderedMembers
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

    /**
     * Thing-overlap margin.
     * 
     * Provides the number of pixels by which the root Thing should overlap its neighbor siblings
     * in its Thing Cohort.
     */
    $: thingOverlapMargin =
        thingCohortExpanded ? graphWidgetStyle.betweenThingOverlap / 2 :
        - graphWidgetStyle.thingSize / 2
</script>