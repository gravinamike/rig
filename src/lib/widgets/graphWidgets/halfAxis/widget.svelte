<script lang="ts">
    import type { Graph, ThingCohort } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"

    import { reorderingInfoStore } from "$lib/stores"

    import {
        RelationshipCohortWidget, ThingCohortWidget
    } from "$lib/widgets/graphWidgets"

    import { changeIndexInArray } from "$lib/shared/utility"


    export let thingCohort: ThingCohort
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle
    export let perspectiveTexts: {[thingId: string]: string}
    export let rootThingWidth: number
    export let rootThingHeight: number
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





</script>


<!-- Thing Cohort Widgets. -->
{#if [1, 2, 3, 4, 5, 6, 7, 8].includes(thingCohort.halfAxisId)}
    <ThingCohortWidget
        {thingCohort}
        {cohortMembersToDisplay}
        bind:graph
        {graphWidgetStyle}
        {perspectiveTexts}
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
    />
{/if}