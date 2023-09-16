<script lang="ts">
    // Import types.
    import type { Graph, ThingCohort } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"

    // Import stores.
    import { reorderingInfoStore } from "$lib/stores"

    // Import related widgets.
    import { RelationshipCohortWidget, ThingCohortWidget } from "$lib/widgets/graphWidgets"

    // Import utility functions.
    import { changeIndexInArray } from "$lib/shared/utility"


    export let thingCohort: ThingCohort
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle
    export let rootThingWidth: number
    export let rootThingHeight: number
    export let perspectiveTexts: {[thingId: string]: string}
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
</script>


<!-- Thing Cohort Widgets. -->
{#if [1, 2, 3, 4, 5, 6, 7, 8].includes(thingCohort.halfAxisId)}
    <ThingCohortWidget
        {thingCohort}
        {cohortMembersToDisplay}
        bind:graph
        {graphWidgetStyle}
        {offsetToAlignToGrid}
        bind:perspectiveTexts
        {rePerspectToThingId}
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
        {offsetToAlignToGrid}
    />
{/if}