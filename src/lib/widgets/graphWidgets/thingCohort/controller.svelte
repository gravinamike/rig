<script lang="ts">
    // Import types.
    import type { ThingCohort } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"

    // Import basic SvelteKit framework resources.
    import { tweened } from "svelte/motion"
    import { cubicOut } from "svelte/easing"

    // Import constants.
    import { halfAxisOppositeIds, offsetsByHalfAxisId } from "$lib/shared/constants"


    
    /**
     * Create a Graph Widget Model.
     * @param thingcohort - The Thing Cohort that the widget is based on.
     * @param graphWidgetStyle - Controls the style of the Graph widget.
     * @param offsetToAlignToGrid - The offset, in pixels, needed to align the Relationships to the grid (if in use).
     * @param expanded - Whether the Thing Cohort is expanded or collapsed.
     * @param xYOffsets - The X and Y offsets of the widget relative to its parent Clade widget.
     * @param zIndex - The stacking order of the widget relative to other HTML elements.
     * @param rowOrColumn - Whether the Things are arranged in a row or column.
     * @param indexOfGrandparentThing - The index of the Thing Cohort's grandparent Thing if it is included the Thing Cohort.
     * @param offsetToGrandparentThingX - The X component of the offset between the center of the Thing Cohort and the grandparent Thing.
     * @param offsetToGrandparentThingY - The Y component of the offset between the center of the Thing Cohort and the grandparent Thing.
     * @param widgetWidthMinusBorder - The width of the widget, disregarding the Thing-Cohort-bounding border.
     * @param widgetHeightMinusBorder - The height of the widget, disregarding the Thing-Cohort-bounding border.
     * @param showMembers - Whether to display the member Things of the Thing Cohort.
     */
    
    // Input props.
    export let thingCohort: ThingCohort
    export let graphWidgetStyle: GraphWidgetStyle
    export let offsetToAlignToGrid: number
    export let expanded = false

    // Output props.
    export let xYOffsets: { x: number, y: number }
    export let zIndex: number
    export let rowOrColumn: "row" | "column"
    export let gap: number
    export let indexOfGrandparentThing: number | null
    export let offsetToGrandparentThingX: number
    export let offsetToGrandparentThingY: number
    export let widgetWidthMinusBorder: number
    export let widgetHeightMinusBorder: number
    export let showMembers: boolean



    /* --------------- Output attributes. --------------- */

    /**
     * X and Y offsets.
     * 
     * The X and Y offsets of the Thing Chort Widget determine its horizontal and
     * vertical offset from the center of its parent Clade Widget.
     */
    $: xYOffsets = 
        // For Inward and Outward half-axes, there is no offset.
        [7, 8].includes(thingCohort.halfAxisId) ? {
            x: 0,
            y: 0
        } :
        // For all other half-axes, each offset is...
        {
            x: (
                // ...the "orbit" distance of related Things from their
                // parents, in the appropriate direction for the half-axis.
                (graphWidgetStyle.relationDistance + offsetToAlignToGrid) * offsetSigns[0]
            ),
            y: (
                (graphWidgetStyle.relationDistance + offsetToAlignToGrid) * offsetSigns[1]
            )
        }

    /**
     * Z index.
     * 
     * The Z index of the Thing Cohort Widget determines its stacking order
     * when overlapped with other items in the view.
     */
    $: zIndex =
        // For half-axis 0, Z index is neutral (0).
        thingCohort.halfAxisId === null ? 0 :
        // For all other half-axes, Z index is double the Generation ID, in the
        // appropriate direction for the half-axis...
        2 * thingCohort.address.generationId * offsetSigns[2]
    
    /* Determine if w */
    /**
     * Row or column.
     * 
     * The row or column attribute determines whether the widget is formatted
     * with Things in a row or in a column.
     */
    $: rowOrColumn = 
        // If the half-axis is either vertical or perpendicular to the view
        // plane, align Things in a column.
        thingCohort.halfAxisId && [3, 4, 5, 6, 7, 8].includes(thingCohort.halfAxisId) ? "column" :
        // For all other half-axes, align things in a row.
        "row"

    /**
     * Gap.
     * 
     * The gap between sibling Things in the Thing Cohort, in pixels.
     */
    $: gap =
        // If the half-axis is not down, up, right or left, the gap is 4.
        [5, 6, 7, 8].includes(thingCohort.halfAxisId) ? 4 :

        // Otherwise, if the Thing Cohort is expanded, the gap is set by the Graph Widget style
        // object.
        expanded ? graphWidgetStyle.betweenThingGap:

        // Otherwise (if it's collapsed), the gap is 0.
        0

    // Tweened version of `gap`, for animation.
    const tweenedGap = tweened( 1, { duration: 100, easing: cubicOut } )
    $: tweenedGap.set(gap)

    /**
     * Index of grandparent Thing.
     * 
     * If the Thing Cohort contains its own "doubled-back" grandparent Thing, this
     * is the index of that grandparent Thing in the Thing Cohort.
     */
    $: indexOfGrandparentThing = 
        // If this Thing Cohort has no grandparent Thing, the index is null.
        grandparentThingId === null ? null :
        // Otherwise, find the index in the Thing Cohort's members.
        thingCohort.members.findIndex(
            member => member.thingId === grandparentThingId
        )

    /**
     * Offset to grandparent Thing.
     * 
     * The offset to the grandparent Thing is the difference between 1. the
     * center-point of the Thing Cohort along its long axis and 2. the mid-point
     * of the grandparent Thing (if it is included in the Thing Cohort).
     * 
     * This is used to re-center the Thing Cohort so that any new Thing Spacer
     * Widget representing the grandparent Thing lines up over the previously-
     * rendered grandparent Thing Widget itself.
     */
    $: offsetToGrandparentThing = 

        // Cohorts in the last, Relationships-only Generation are always empty,
        // and don't need to be rendered, so a zero offset is fine.
        thingCohort.isInRelationshipsOnlyGeneration ? 0 :

        // For all Cohorts that *do* need to be rendered, the offset is the sum
        // of 1. the Thing Cohort's offset to its grandparent Thing and 2. the
        // offset between the new Thing Spacer and the center-point of the Thing
        // Cohort.
        parentThingOffsetToGrandparentThing + grandparentSpacerOffsetToParentThing
    
    /**
     * X and Y components of offset to grandparent Thing.
     * 
     * The base offset to the grandparent Thing is the offset along the long axis
     * of the Thing Cohort. Here the X and Y components of the offset are 
     * determined based on whether the Thing Cohort's Things are formatted in a
     * row or a column.
     */
    $: offsetToGrandparentThingX = 
        rowOrColumn === "row" ? offsetToGrandparentThing :
        0
    $: offsetToGrandparentThingY =
        rowOrColumn === "column" ? offsetToGrandparentThing :
        0

    /**
     * Widget width and height, minus border.
     * 
     * The width and height of the widget, disregarding the Thing-Cohort-bounding border.
     */
    $: widgetWidthMinusBorder =
        thingCohort.rowOrColumn() === "row" ? $tweenedSizeAlongLongAxis :
        graphWidgetStyle.thingSize
    $: widgetHeightMinusBorder =
        thingCohort.rowOrColumn() === "column" ? $tweenedSizeAlongLongAxis :
        graphWidgetStyle.thingSize

    /**
     * Show-members flag.
     * 
     * This attribute determines whether the Thing Cohort's member Things should
     * be shown. The only case where this is false is when the Thing Cohort
     * "doubles back" towards its own grandparent Thing, and that grandparent
     * Thing is the only member of the Thing Cohort.
     */
    $: showMembers =
        isDoubledBackHalfAxis && thingCohort.members.length === 1 ? false :
        true


    /* --------------- Supporting attributes. --------------- */

    /*
     * Offset signs.
     *
     * These distinguish between two directional options for each of a set of
     * spatial attributes including X and Y offsets, Z index and encapsulation
     * level. For example, for the X offset, left is negative (-1) and right is
     * positive (1). Offset signs are specific to a half-axis.
     */
    $: offsetSigns = offsetsByHalfAxisId[thingCohort.halfAxisId]

    /*
     * Grandparent Thing ID.
     *
     * The ID of the Thing Cohort's grandparent Thing. It is based on the ID of
     * the parent Thing of the parent Thing Cohort of the Thing Cohort, assuming
     * each of those exist (otherwise the default is null).
     */
    $: grandparentThingId = thingCohort.parentThingCohort()?.address.parentThingId || null

    /*
     * Parent Thing's offset to grandparent Thing.
     *
     * The offset between the Thing Cohort's parent Thing and its grandparent
     * Thing, assuming both exist and the Thing Cohort is on a half-axis that 
     * "doubles back" towards its grandparent Thing (otherwise the default is 0).
     */
    $: parentThingOffsetToGrandparentThing =
        // If the parent Thing and grandparent Thing exist and the Thing Cohort
        // is on a "doubled-back" half-axis...
        thingCohort.parentThing?.address && grandparentThingId && isDoubledBackHalfAxis ? (
            // ...multiply the index of the parent Thing in its Thing Cohort...
            thingCohort.parentThing.address.indexInCohort
            // ...by the space each Thing takes up on the long axis of its Thing
            // Cohort.
            * (
                graphWidgetStyle.thingSize
                + graphWidgetStyle.betweenThingSpacing
            )
        ) :
        // Otherwise, the offset is 0.
        0

    /*
     * Grandparent-spacer's offset to parent Thing.
     *
     * The offset between 1. the "spacer" widget representing the Thing Cohort's
     * grandparent Thing and 2. the Thing Cohort's parent Thing, assuming the
     * grandparent Thing is included in the Cohort (otherwise the default is 0).
     */
    $: grandparentSpacerOffsetToParentThing =
        // If the grandparent Thing is included in the Cohort...
        indexOfGrandparentThing !== null && indexOfGrandparentThing !== -1 ? (
            // ...multiply the difference between the "halfway" index of the
            // Thing Cohort (which may be a fraction if there are an odd number
            // of Things) and the index of the grandparent Thing in the Thing
            // Cohort...
            (
                (thingCohort.members.length - 1) / 2
                - indexOfGrandparentThing
            )
            // ...by the space each Thing takes up on the long axis of its Thing
            // Cohort.
            * (
                graphWidgetStyle.thingSize
                + graphWidgetStyle.betweenThingSpacing
            ) 
        ) :
        // Otherwise, the offset is 0.
        0

    /**
     * Size along long axis.
     * 
     * The size of the Thing Cohort widget along whichever axis is longer.
     */
    $: sizeAlongLongAxis =
        // If the Thing Cohort widget is expanded, the size is the sum of the sizes of the
        // constituent Things plus the gaps between them.
        expanded ? (
            thingCohort.members.length * graphWidgetStyle.thingSize
            + (thingCohort.members.length - 1) * graphWidgetStyle.betweenThingSpacing
        ) :

        // Otherwise (if it is collapsed), the size is equivalent to one Thing's size.
        graphWidgetStyle.thingSize

    // Tweened version of `sizeAlongAxis`, for animation.
    const tweenedSizeAlongLongAxis = tweened( 1, { duration: 100, easing: cubicOut } )
    $: tweenedSizeAlongLongAxis.set(sizeAlongLongAxis)  

    /*
     * Is-doubled-back-half-axis flag.
     *
     * This attribute indicates whether the Thing Cohort is on a half-axis that
     * "doubles back" towards the half-axis of its grandparent Thing. It is true
     * if the half-axis ID of the Thing Cohort's parent Thing Cohort is the
     * opposite of the half-axis of the Thing Cohort.
     */
    $: isDoubledBackHalfAxis =
        thingCohort.parentThingCohort()?.halfAxisId === halfAxisOppositeIds[thingCohort.halfAxisId]
</script>