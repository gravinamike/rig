<script lang="ts">
    // Import types.
    import type { ThingCohort, Thing } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"

    /**
     * @param {Thing} rootThing - The Thing that forms the root of the Clade.
     * @param {GraphWidgetStyle} graphWidgetStyle - Controls the style of the Graph widget.
     * @param {string} overlapMarginStyleText - The CSS text to handle the overlap between the widgets.
     */
    export let rootThing: Thing
    export let graphWidgetStyle: GraphWidgetStyle
    
    export let overlapMarginStyleText: string = ""

    
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
        // If there is only 1 Thing in the Thing Cohort, use an empty string (no formatting).
        rootThing.parentCohort.members.length === 1 ? "" :
        // Else, if the Thing is the first in the Thing Cohort, use only a right or bottom overlap margin.
        rootThing.address.indexInCohort === 0 ? (
            rowOrColumn === "row" ? `margin-right: ${overlapMargin}px;` :
            `margin-bottom: ${overlapMargin}px;`
        ) :
        // Else, if the Thing is the last in the Thing Cohort, use only a left or top overlap margin.
        rootThing.address.indexInCohort === rootThing.parentCohort.members.length - 1 ? (
            rowOrColumn === "row" ? `margin-left: ${overlapMargin}px;` :
            `margin-top: ${overlapMargin}px;`
        // Else, use overlap margins on both sides (left/right or top/bottom).
        ) : (
            rowOrColumn === "row" ? `margin-left: ${overlapMargin}px; margin-right: ${overlapMargin}px;` :
            `margin-top: ${overlapMargin}px; margin-bottom: ${overlapMargin}px;`
        )

    
    /* --------------- Supporting attributes. --------------- */

    /**
     * Row-or-column attribute.
     * 
     * Indicates whether the root Thing's Thing Cohort is arranged as a row or a
     * column.
     */
    $: rowOrColumn = rootThing.parentCohort.rowOrColumn()
    
    /**
     * Overlap margin.
     * 
     * Provides the number of pixels by which the root Thing should overlap its
     * neighbors in the Thing Cohort.
     */
    $: overlapMargin = graphWidgetStyle.betweenThingOverlap / 2














    /* Attributes for outline version of the widget. */


    export let thingCohorts: ThingCohort[] = []
    export let showCladeRootThing = true
    export let orderedThingCohorts: ThingCohort[] = []


    // Thing-Cohort-related variables.
    $: thingCohorts = rootThing.childThingCohorts

    /**
     * Show-Clade-root-Thing flag.
     * 
     * Determines whether the full Clade, including the root Thing, should be
     * shown, or only the children Things.
     */
    $: showCladeRootThing = (
        rootThing.address.generationId === 0
        && graphWidgetStyle.excludePerspectiveThing
    ) ?
        false :
        true

    // The desired order of "Cartesian" half-axes in the outline.
    const orderedCartesianHalfAxisIds = [2, 1, 4, 3]

    // The desired order of "non-Cartesian" half-axes in the outline.
    const orderedNonCartesianHalfAxisIds = [5, 6, 8, 7]

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


        /*
        Any on-axis Directions (1, 3, 2, 4)
        Off-axis Directions in the Space, in the order of the Space.
        Other Directions, ordered according to their order attribute.
        */

        

        const allCohortGroups: ThingCohort[][] = []
        const thingCohortsOnCartesianHalfAxes: ThingCohort[] = []
        const thingCohortsOnNonCartesianHalfAxes: ThingCohort[] = []
        const thingCohortsNotOnHalfAxes: ThingCohort[] = []

        // If the reordering process should include the "Cartesian" half-axes
        // (Down, Up, Right, Left), add all Thing Cohorts which *are* on
        // those main half-axes to an array.
        if (!graphWidgetStyle.excludeCartesianAxes) {

            // Get an array of IDs for all Cartesian half-axes in this Clade that currently
            // have Thing Cohorts, in the desired order for an outline.
            const orderedCartesianHalfAxisIdsWithThings = orderedCartesianHalfAxisIds.filter(
                id => id in thing.childCohortsByHalfAxisId
            )

            // For every half-axis ID in that array, add the corresponding Thing
            // Cohort from the Clade's root Thing to the array of Thing Cohorts
            // that are on the Cartesian half-axes.
            for (const halfAxisId of orderedCartesianHalfAxisIdsWithThings) {
                thingCohortsOnCartesianHalfAxes.push(thing.childCohortsByHalfAxisId[halfAxisId])
            }
        }




        // If the reordering process should include Thing Cohorts on the
        // non-Cartesian half-axes,
        if (!graphWidgetStyle.excludeNonCartesianAxes) {
            // Get an array of IDs for all non-Cartesian half-axes in this Clade that currently
            // have Thing Cohorts, in the desired order for an outline.
            const orderedNonCartesianHalfAxisIdsWithThings = orderedNonCartesianHalfAxisIds.filter(
                id => id in thing.childCohortsByHalfAxisId
            )

            // For every half-axis ID in that array, add the corresponding Thing
            // Cohort from the Clade's root Thing to the array of Thing Cohorts
            // that are on the non-Cartesian half-axes.
            for (const halfAxisId of orderedNonCartesianHalfAxisIdsWithThings) {
                thingCohortsOnNonCartesianHalfAxes.push(thing.childCohortsByHalfAxisId[halfAxisId])
            }
        }




        // If the reordering process should include Thing Cohorts not on
        // a half-axis,
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
        allCohortGroups.push(thingCohortsOnCartesianHalfAxes)
        allCohortGroups.push(thingCohortsOnNonCartesianHalfAxes)
        allCohortGroups.push(thingCohortsNotOnHalfAxes)
        const orderedThingCohorts = allCohortGroups.flat()

        return orderedThingCohorts
    }
    $: orderedThingCohorts = getOrderedThingCohorts(rootThing)
</script>