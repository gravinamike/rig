<script lang="ts">
    // Import types.
    import type { ThingCohort, GenerationMember, Thing, Graph } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"

    // Import SvelteKit framework resources.
    import { tick } from "svelte"

    // Import constants.
    import { cartesianHalfAxisIds } from "$lib/shared/constants"

    // Import utility functions.
    import { readOnlyArrayToArray, sleep } from "$lib/shared/utility"

    

    /**
     * @param thingOverlapMargin - The amount to overlap sibling Things (in pixels) if the overlap percentage is negative.
     * @param parentThingCohortRowOrColumn - Whether the Clade's parent Thing Cohort is arranged as a row or column.
     * @param getThingOverlapMarginStyleText - Function to get the style text to implement the desired overlap between sibling Things.
     * @param rootThing - The Thing that forms the root of the Clade.
     * @param graphWidgetStyle - Controls the style of the Graph widget.
     * @param rootThingWidth - The width of the Clade's root Thing.
     * @param rootThingHeight - The height of the Clade's root Thing.
     * @param rootThingThingCohortMembers - Array containing all members of the Thing Cohort containing the root Thing.
     * @param rootThingThingCohortExpanded - Whether the Thing Cohort this is part of is expanded or collapsed.
     * @param thingCohorts - The Thing Cohorts included in the Clade.
     * @param orderedThingCohorts - The Thing Cohorts in the order they are to be displayed in the outline version of the widget.
     * @param orderedThingCohortsWithMembers - The ordered Thing Cohorts that have members.
     * @param childThings - All child Things in the Clade.
     * @param showCladeRootThing - Whether to display the root Thing of the Clade.
     * @param rootThingOffsetFromCenterOfThingCohort - The offset (in pixels) betwen the root Thing and the center of its Thing Cohort.
     * @param cartesianThingCohorts - The Thing Cohorts that are on the Cartesian half-axes.
     * @param showAsCollapsed - Whether to format the Clade widget to indicate its parent Thing Cohort is collapsed.
     */
    export let graph: Graph
    export let thingOverlapMargin: number = 0
    export let parentThingCohortRowOrColumn: "row" | "column" = "row"
    export let getThingOverlapMarginStyleText: (
        thing: Thing,
        thingOverlapMargin: number,
        thingCohortRowOrColumn: "row" | "column"
    ) => string = () => ""
    export let parentThingCohortMemberOnTopIndex = 0
    export let rootThing: Thing
    export let graphWidgetStyle: GraphWidgetStyle
    export let rootThingWidth = 0
    export let rootThingHeight = 0
    export let rootThingThingCohortMembers: GenerationMember[] = []
    export let rootThingThingCohortExpanded: boolean = false
    export let thingCohorts: ThingCohort[] = []
    export let orderedThingCohorts: ThingCohort[] = []
    export let orderedThingCohortsWithMembers: ThingCohort[] = []
    export let orderedThingCohortsWithMembersReady = false
    export let childThings: Thing[] = []
    export let showCladeRootThing = true
    export let cladeControlsOpened = false

    export let overlapMarginStyleText: string = ""
    export let rootThingOffsetFromCenterOfThingCohort = 0
    export let onTopInThingCohort = false
    export let cartesianThingCohorts: ThingCohort[] = []
    export let showAsCollapsed = false
    export let hoveredForHalfSecond = false
    export let forceShowHalfAxisWidgets = false
    export let trackTimeHovered: (initialize?: boolean, increment?: number) => void = () => {}
    export let stopTrackingTimeHovered: () => void = () => {}





    let timeHovered: number | null = null
    trackTimeHovered = async (initialize=false, increment=100) => {
        if (initialize) timeHovered = 0
        else if (timeHovered === null) return
        else if (timeHovered > 100000) {
            timeHovered = null
            return
        }
        else timeHovered += increment
        
        await sleep(increment)
        trackTimeHovered(false, increment)
    }
    stopTrackingTimeHovered = () => {
        timeHovered = null
    }


    $: hoveredForHalfSecond = timeHovered !== null && timeHovered >= 500




    // Fix glitch where closing a Thing form leaves the half-axes shown.
    $: formActive = graph.formActive
    $: if (formActive === false) {
        (async () => {
            await tick()
            stopTrackingTimeHovered()
        })()
    }


    $: forceShowHalfAxisWidgets = (
        rootThing.address?.generationId === 0
        || (
            graph.rePerspectInProgressThingId === null
            && cladeControlsOpened
        )
    )






    
    /* --------------- Output attributes. --------------- */

    /**
     * Overlap-margin style text.
     * 
     * The style text that implements the desired overlap between sibling Things.
     */
    $: overlapMarginStyleText = getThingOverlapMarginStyleText(rootThing, thingOverlapMargin, parentThingCohortRowOrColumn)

    /**
     * Root Thing offset from center of Thing Cohort.
     * 
     * The offset (in pixels) betwen the root Thing and the center of its Thing Cohort. Used to
     * calculate offsets of child Thing Cohorts and Relationships when adjusting to fit a grid.
     */
     $: rootThingOffsetFromCenterOfThingCohort =    
        // If the root Thing's Thing Cohort or address are null,
        (
            !rootThing.parentThingCohort
            || !rootThing.address

        // The offset is 0.
        ) ? 0 :

        // Otherwise the offset is...
        (
            // ...the difference between the index of the Thing in its Thing Cohort and the halfway
            // index of that Thing Cohort...
            (
                rootThing.address.indexInCohort
                - (rootThing.parentThingCohort.members.length - 1) / 2
            )

            // ...multiplied by either the Thing width or height (depending on the half-axis) plus
            // the spacing between Things in the Thing Cohort.
            * (
                (
                    rootThing.parentThingCohort.halfAxisId && [1, 2].includes(
                        rootThing.parentThingCohort.halfAxisId
                    ) ? rootThingWidth :
                    rootThingHeight
                )
                + graphWidgetStyle.betweenThingSpacing
            )
        )

    /**
     * Clade-on-top-in-Thing-Cohort indicator.
     * 
     * Indicates whether the Clade's root Thing is visually in front of the other Things in its
     * Thing Cohort.
     */
    $: onTopInThingCohort = parentThingCohortMemberOnTopIndex === rootThing.address?.indexInCohort as number

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
     * Show-as-collapsed indicator.
     * 
     * Whether to format the Clade widget to indicate its parent Thing Cohort is collapsed.
     */
    $: showAsCollapsed = rootThingThingCohortMembers.length > 1 && !rootThingThingCohortExpanded


    /* --------------- Output attributes for outline version of the widget. --------------- */

    /**
     * Thing Cohorts.
     * 
     * The Thing Cohorts included in the Clade.
     */
    $: thingCohorts = rootThing.childThingCohorts




    function generateOrderedThingCohortsWithMembers() {
        // The Thing Cohorts in the order they are to be displayed in the outline version of the widget.
        orderedThingCohorts = rootThing.getOrderedThingCohorts(
            graphWidgetStyle.excludeCartesianAxes,
            graphWidgetStyle.excludeNonCartesianAxes,
            graphWidgetStyle.excludeNonAxisThingCohorts
        )

        // Same as ordered Thing Cohorts, but including only those Cohorts that have
        orderedThingCohortsWithMembers = orderedThingCohorts.filter(
            thingCohort => thingCohort.members.length
        )

        orderedThingCohortsWithMembersReady = true
    }

    $: excludeCartesianAxes = graphWidgetStyle.excludeCartesianAxes
    $: excludeNonCartesianAxes = graphWidgetStyle.excludeNonCartesianAxes
    $: excludeNonAxisThingCohorts = graphWidgetStyle.excludeNonAxisThingCohorts
    $: {
        excludeCartesianAxes
        excludeNonCartesianAxes
        excludeNonAxisThingCohorts

        generateOrderedThingCohortsWithMembers()
    }
    



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



    /* --------------- Supporting attributes. --------------- */
    

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
    /*function getOrderedThingCohorts( thing: Thing ): ThingCohort[] {

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
    }*/
</script>