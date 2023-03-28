<script lang="ts">
    // Import types.
    import type { ThingCohort, Thing } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"

    // Import utility functions.
    import { readOnlyArrayToArray } from "$lib/shared/utility"

    // Import constants.
    import {
            cartesianHalfAxisIds, orderedCartesianHalfAxisIds, orderedNonCartesianHalfAxisIds
    } from "$lib/shared/constants"


    /**
     * @param rootThing - The Thing that forms the root of the Clade.
     * @param graphWidgetStyle - Controls the style of the Graph widget.
     * @param overlapMarginStyleText - The CSS text to handle the overlap between the widgets.
     * @param thingCohorts - The Thing Cohorts included in the Clade.
     * @param cartesianThingCohorts - The Thing Cohorts that are on the Cartesian half-axes.
     * @param orderedThingCohorts - The Thing Cohorts in the order they are to be displayed in the outline version of the widget.
     * @param orderedThingCohortsWithMembers - The ordered Thing Cohorts that have members.
     * @param childThings - All child Things in the Clade.
     * @param showCladeRootThing - Whether to display the root Thing of the Clade.
     * @param expandable - Whether the Clade can be collapsed to hide children or expanded to show them.
     * @param expanded - Whether the Clade is collapsed to hide children or expanded to show them.
     */
    export let rootThing: Thing
    export let graphWidgetStyle: GraphWidgetStyle
    export let overlapMarginStyleText: string = ""
    export let thingCohorts: ThingCohort[] = []
    export let cartesianThingCohorts: ThingCohort[] = []
    export let orderedThingCohorts: ThingCohort[] = []
    export let orderedThingCohortsWithMembers: ThingCohort[] = []
    export let childThings: Thing[] = []
    export let showCladeRootThing = true
    export let expandable = false
    export let expanded = false

    
    /* --------------- Output attributes. --------------- */

    /**
     * Overlap-margin style text.
     * 
     * When Things are styled to overlap, the effect is accomplished through CSS
     * margins. This attribute provides the CSS text to style the Thing based
     * on its position in the Thing Cohort and whether the Thing Cohort is
     * arranged in a row or column.
     */
    $: overlapMarginStyleText =
        // If the root Thing has no parent Cohort or address, (it hasn't yet
        // been built into a Graph), use an empty string (no formatting).
        !rootThing.parentCohort || !rootThing.address ? "" :
        // If there is only 1 Thing in the Thing Cohort, use an empty string
        // (no formatting).
        rootThing.parentCohort.members.length === 1 ? "" :
        // Else, if the Thing is the first in the Thing Cohort, use only a
        // right or bottom overlap margin.
        rootThing.address.indexInCohort === 0 ? (
            rowOrColumn === "row" ? `margin-right: ${overlapMargin}px;` :
            `margin-bottom: ${overlapMargin}px;`
        ) :
        // Else, if the Thing is the last in the Thing Cohort, use only a left
        // or top overlap margin.
        rootThing.address.indexInCohort === rootThing.parentCohort.members.length - 1 ? (
            rowOrColumn === "row" ? `margin-left: ${overlapMargin}px;` :
            `margin-top: ${overlapMargin}px;`
        // Else, use overlap margins on both sides (left/right or top/bottom).
        ) : (
            rowOrColumn === "row" ? `margin-left: ${overlapMargin}px; margin-right: ${overlapMargin}px;` :
            `margin-top: ${overlapMargin}px; margin-bottom: ${overlapMargin}px;`
        )


    /* --------------- Output attributes for outline version of the widget. --------------- */

    /**
     * Thing Cohorts.
     * 
     * The Thing Cohorts included in the Clade.
     */
    $: thingCohorts = rootThing.childThingCohorts

    /**
     * Cartesian Thing Cohorts.
     * 
     * Same as the Thing Cohorts, but only those that are on the "Cartesian"
     * half-axes (1, 2, 3, 4).
     */
    $: cartesianThingCohorts = rootThing.childThingCohorts.filter(
        cohort => readOnlyArrayToArray(cartesianHalfAxisIds).includes(cohort.halfAxisId)
    )

    /**
     * Ordered Thing Cohorts.
     * 
     * The Thing Cohorts in the order they are to be displayed in the outline version of the widget.
     */
    $: orderedThingCohorts = getOrderedThingCohorts(rootThing)

    /**
     * Ordered Thing Cohorts with members.
     * 
     * Same as ordered Thing Cohorts, but including only those Cohorts that have
     * members (aren't empty).
     */
     $: orderedThingCohortsWithMembers = orderedThingCohorts.filter(
        thingCohort => thingCohort.members.length
    )

    /**
     * Array of all Things across all the Thing Cohorts in the Clade.
     */
    $: childThings = (
        thingCohorts
            .map(thingCohort => thingCohort.members).flat()
            .filter(thingCohortMember => thingCohortMember.thing !== null)
        ) as unknown as Thing[]

    /**
     * Show-Clade-root-Thing flag.
     * 
     * Determines whether the full Clade, including the root Thing, should be
     * shown, or only the children Things.
     */
     $: showCladeRootThing = (
        // Show the root Thing unless the Clade's Generation is 0...
        rootThing.address?.generationId === 0
        // ... and the exclude-Perspective-Thing flag is true.
        && graphWidgetStyle.excludePerspectiveThing
    ) ?
        false :
        true


    /**
     * Expandable flag.
     * 
     * Determines whether the Clade can be collapsed to hide children or
     * expanded to show them.
     */
     $: expandable = (
        // The Clade is expandable if there are Thing Cohorts...
        thingCohorts.length
        // ... the Cohorts have a Generation...
        && thingCohorts[0].generation
        // ...and that Generation is not a Relationships-only Generation.
        && !thingCohorts[0].generation.isRelationshipsOnly
    ) ? true :
    false

    /**
     * Expanded flag.
     * 
     * Determines whether the Clade is collapsed to hide children or expanded
     * to show them. Starts true for the Generation 0 Clade, otherwise starts
     * false.
     */
    $: expanded =
        expandable && rootThing.address?.generationId === 0 ? true :
        false
    
    
    
    /* --------------- Supporting attributes. --------------- */

    /**
     * Row-or-column attribute.
     * 
     * Indicates whether the root Thing's Thing Cohort is arranged as a row or a
     * column.
     */
    $: rowOrColumn = rootThing.parentCohort?.rowOrColumn() || "row"
    
    /**
     * Overlap margin.
     * 
     * Provides the number of pixels by which the root Thing should overlap its
     * neighbors in the Thing Cohort.
     */
    $: overlapMargin = graphWidgetStyle.betweenThingOverlap / 2
    

    /* --------------- Support attributes for outline version of the widget. --------------- */

    /**
     * Ordering Thing Cohorts.
     * 
     * Thing Cohorts are ordered in a specific way:
     * 1. First those on the "Cartesian" half-axes, from top to bottom and left
     *    to right,
     * 2. Then those on the other half-axes,
     * 3. Then all those not on a half-axis.
     */
    function getOrderedThingCohorts( thing: Thing ): ThingCohort[] {

        // If the reordering process should include the "Cartesian" half-axes
        // (Down, Up, Right, Left), add all Thing Cohorts which *are* on
        // those main half-axes to an array.
        const thingCohortsOnCartesianHalfAxes: ThingCohort[] = []
        if (!graphWidgetStyle.excludeCartesianAxes) {

            // Get an array of IDs for all Cartesian half-axes in this Clade that currently
            // have Thing Cohorts, in the desired order for an outline.
            const orderedCartesianHalfAxisIdsWithThings = orderedCartesianHalfAxisIds.filter(
                id => id in thing.childThingCohortByHalfAxisId
            )

            // For every half-axis ID in that array, add the corresponding Thing
            // Cohort from the Clade's root Thing to the array of Thing Cohorts
            // that are on the Cartesian half-axes.
            for (const halfAxisId of orderedCartesianHalfAxisIdsWithThings) {
                thingCohortsOnCartesianHalfAxes.push(thing.childThingCohortByHalfAxisId[halfAxisId])
            }
        }

        // If the reordering process should include Thing Cohorts on the
        // non-Cartesian half-axes,
        const thingCohortsOnNonCartesianHalfAxes: ThingCohort[] = []
        if (!graphWidgetStyle.excludeNonCartesianAxes) {
            // Get an array of IDs for all non-Cartesian half-axes in this Clade that currently
            // have Thing Cohorts, in the desired order for an outline.
            const orderedNonCartesianHalfAxisIdsWithThings = orderedNonCartesianHalfAxisIds.filter(
                id => id in thing.childThingCohortByHalfAxisId
            )

            // For every half-axis ID in that array, add the corresponding Thing
            // Cohort from the Clade's root Thing to the array of Thing Cohorts
            // that are on the non-Cartesian half-axes.
            for (const halfAxisId of orderedNonCartesianHalfAxisIdsWithThings) {
                thingCohortsOnNonCartesianHalfAxes.push(thing.childThingCohortByHalfAxisId[halfAxisId])
            }
        }

        // If the reordering process should include Thing Cohorts not on
        // a half-axis,
        const thingCohortsNotOnHalfAxes: ThingCohort[] = []
        if (!graphWidgetStyle.excludeNonAxisThingCohorts) {
            // Add all Thing Cohorts which *are not* on half-axes to an array.
            thingCohortsNotOnHalfAxes.push(
                ...thing.childThingCohorts
                    .filter(cohort => {
                        return (
                            !orderedCartesianHalfAxisIds.includes(cohort.halfAxisId)
                            && !orderedNonCartesianHalfAxisIds.includes(cohort.halfAxisId)
                        )
                    })
            )
        }

        // Combine the arrays to produce a single array of all Thing Cohorts for
        // this Clade, starting with those on the half-axes in the desired
        // order, and followed by those not on the main half-axes.
        const allCohortGroups: ThingCohort[][] = []
        allCohortGroups.push(thingCohortsOnCartesianHalfAxes)
        allCohortGroups.push(thingCohortsOnNonCartesianHalfAxes)
        allCohortGroups.push(thingCohortsNotOnHalfAxes)
        const orderedThingCohorts = allCohortGroups.flat()

        // Return the combined array.
        return orderedThingCohorts
    }
</script>