<script lang="ts">
    import type { ThingCohort } from "$lib/models/constructModels"
    import type { GraphWidgetModel } from "../graph/graph"
    import type { ThingWidgetModel } from "$lib/models/widgetModels";
    import { halfAxisOppositeIds, offsetsByHalfAxisId, type GraphWidgetStyle } from "$lib/shared/constants"
    import type {
        ThingMissingFromStoreWidgetModel, ThingAlreadyRenderedWidgetModel
    } from "$lib/models/widgetModels"

    /**
     * Create a Graph Widget Model.
     * @param {ThingCohort} cohort - The Thing Cohort that the widget is based on.
     * @param {GraphWidgetModel} graphWidgetModel - The model of the Graph that the widget is in.
     * @param {ThingWidgetModel} parentThingWidgetModel - The Model of the widget's parent Thing Widget, if it has one.
     */
    
    // Input props.
    export let thingCohort: ThingCohort
    export let parentThingWidgetModel: ThingWidgetModel | null = null
    export let graphWidgetStyle: GraphWidgetStyle
    export let planesOffsets: [number, number]

    // Output props.
    export let xYOffsets: { x: number, y: number }
    export let zIndex: number

    export let rowOrColumn: "row" | "column"

    export let indexOfGrandparentThing: number | null
    export let offsetToGrandparentThingX: number
    export let offsetToGrandparentThingY: number

    export let lifecycleStatus: "new" | "building" | "built" | "failed" | "cleared" = "new"
    export let memberModels: ( ThingWidgetModel | ThingAlreadyRenderedWidgetModel | ThingMissingFromStoreWidgetModel )[] = []


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
                // parents, in the appropriate direction for the half-axis...
                graphWidgetStyle.relationDistance * offsetSigns[0]
                // ...plus any offset for the Plane the Thing is in.
                + planesOffsets[0] * planeId
            ),
            y: (
                graphWidgetStyle.relationDistance * offsetSigns[1]
                + planesOffsets[1] * planeId
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
            member => (typeof member === "object")
            && member.id === grandparentThingId
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
    offsetToGrandparentThingX = 
        rowOrColumn === "row" ? offsetToGrandparentThing :
        0
    offsetToGrandparentThingY =
        rowOrColumn === "column" ? offsetToGrandparentThing :
        0


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
     * Plane ID.
     *
     * Plane ID is taken from the Thing Cohort's Plane ID (with default 0).
     */
    $: planeId = thingCohort.plane?.id || 0

    /*
     * Grandparent Thing ID.
     *
     * The ID of the Thing Cohort's grandparent Thing. It is based on the ID of
     * the parent Thing of the parent Thing Cohort of the Thing Cohort, assuming
     * each of those exist (otherwise the default is null).
     */
    $: grandparentThingId = thingCohort.parentCohort()?.address.parentThingId || null

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
        thingCohort.parentThing && grandparentThingId && isDoubledBackHalfAxis ? (
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

    /*
     * Is-doubled-back-half-axis flag.
     *
     * This attribute indicates whether the Thing Cohort is on a half-axis that
     * "doubles back" towards the half-axis of its grandparent THing. It is true
     * if the half-axis ID of the grandparent Relationships Cohort is the
     * opposite of the half-axis of the Thing Cohort.
     */
    $: isDoubledBackHalfAxis =
        matchedRelationshipCohortWidgetModel?.parentRelationshipsWidgetModel?.halfAxisId
        === halfAxisOppositeIds[thingCohort.halfAxisId]

    /*
     * Matched RelationshipCohortWidgetModel.
     *
     * The Relationship Cohort Widget Model which is "parallel" to this Thing
     * Cohort Widget. In other words, it contains the Relationship Widgets from
     * the parent Thing to the child Things of the Thing Cohort.
     */
    $: matchedRelationshipCohortWidgetModel =
        parentThingWidgetModel?.relationshipsWidgetModelsByHalfAxisId[thingCohort.halfAxisId] || null
</script>