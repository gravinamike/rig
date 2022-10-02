<script lang="ts">
    // Import types.
    import type { Tweened } from "svelte/motion"
    import type { Direction, Graph, ThingCohort, Thing } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"

    // Import basic framework resources.
    import { tweened } from "svelte/motion"
	import { cubicOut } from "svelte/easing"

    // Import constants.
    import {
        halfAxisOppositeIds, rotationByHalfAxisId, mirroringByHalfAxisId,
        offsetsByHalfAxisId, relationshipColorByHalfAxisId,
        zoomBase,
        type HalfAxisId
     } from "$lib/shared/constants"

    // Import stores.
    import { storeGraphDbModels, getGraphConstructs, addGraphIdsNeedingViewerRefresh } from "$lib/stores"

    // Import API functions.
    import { updateRelationships } from "$lib/db/clientSide"
    import type { ThingDbModel } from "$lib/models/dbModels";
    

    /**
     * Create a Relationship Cohort Widget controller.
     * @param {ThingCohort} cohort - The Thing Cohort that is associated with the Relationship Cohort.
     * @param {Graph} graph - The Graph that the Cohort is in.
     * @param {GraphWidgetStyle} graphWidgetStyle - Controls the style of the Graph widget.
     * @param {number | null} thingIdOfHoveredRelationship - The ID of the Thing corresponding to the currently-hovered Relationship, if there is one.
     * @param {boolean} stemHovered - Whether or not the mouse is hovered over the Relationship stem widget.
     * @param {number} widgetOffsetX - The horizontal offset of the widget relative to its parent Clade.
     * @param {number} widgetOffsetY - The vertical offset of the widget relative to its parent Clade.
     * @param {number} zIndex - The stacking order of the widget relative to other HTML elements.
     * @param {number} widgetWidth - The pre-rotation width of the widget in pixels.
     * @param {number} widgetHeight - The pre-rotation height of the widget in pixels.
     * @param {number} opacity - The opacity of the widget.
     * @param {number} rotatedWidth - The width of the widget after it has been rotated based on its half-axis.
     * @param {number} rotatedHeight - The height of the widget after it has been rotated based on its half-axis.
     * @param {-1 | 1} mirroring - Whether the content of the widget is flipped relative to the Graph centerline.
     * @param {number} rotation - Rotation, in degrees, of the widget based on the half-axis.
     * @param {boolean} showDirection - Whether to display the Direction selector widget.
     * @param {Direction} direction - The Direction of the Relationship Cohort.
     * @param {number} directionWidgetRotation - The rotation, in degrees, of the Direction selector widget.
     * @param {(directionId: number) => void} changeRelationshipsDirection - A function that changes the Direction of the Relationships based on the supplied ID.
     * @param {number} relationshipsWidth - The width of the Relationship Cohort widget.
     * @param {number} relationshipsHeight - The height of the Relationship Cohort widget.
     * @param {number} tweenedScale - The HTML scale of the Graph widget, smoothly interpolated. Used for zooming.
     * @param {number} midline - The horizontal location of the Relationship stem midline (pre-rotation).
     * @param {number} stemBottom - The vertical location of the bottom of the Relationship stem (pre-rotation).
     * @param {number} stemTop - The vertical location of the top of the Relationship stem (pre-rotation).
     * @param {boolean} showRelationships - Whether to display the Relationship widgets (besides the stem).
     * @param {string} relationshipColor - The color of the Relationship widget, determined by the half-axis.
     * @param {string} sizeOfThingsAlongWidth - The size of a Thing widget along the "width" dimension of its Thing Cohort widget.
     */
    export let cohort: ThingCohort
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle

    export let thingIdOfHoveredRelationship: number | null = null
    export let stemHovered = false
    export let thingWidth = 0
    export let thingHeight = 0
    export let widgetOffsetX = 0
    export let widgetOffsetY = 0
    export let zIndex = 0
    export let widgetWidth = 0
    export let widgetHeight = 0
    export let opacity = 1
    export let rotatedWidth = 0
    export let rotatedHeight = 0
    export let mirroring: 1 | -1 = 1
    export let rotation = 0
    export let showDirection = false
    export let direction: Direction | null
    export let directionWidgetRotation = 0
    export let changeRelationshipsDirection: (directionId: number) => void = () => {}
    export let relationshipsWidth = 0
    export let relationshipsLength = 0
    export let tweenedScale: Tweened<number> = tweened(1)
    export let midline = 0
    export let stemBottom = 0
    export let stemTop = 0
    export let showRelationships = false
    export let relationshipColor = "#000000"
    export let halfAxisId: HalfAxisId
    export let sizeOfThingsAlongWidth = 0

    
    /* --------------- Output attributes. --------------- */

    /**
     * Widget offset X component.
     * 
     * The total horizontal offset, in pixels, of the widget relative to its
     * parent Clade. Determined by the sum of the basic offset and the offset to
     * the associated Thing Cohort's grandparent Thing.
     */
    $: widgetOffsetX = xOffset + xOffsetToGrandparentThing

    /**
     * Widget offset Y component.
     * 
     * The total vertical offset, in pixels, of the widget relative to its parent
     * Clade. Determined by the sum of the basic offset and the offset to the
     * associated Thing Cohort's grandparent Thing.
     */
    $: widgetOffsetY = yOffset + yOffsetToGrandparentThing

    /**
     * Z index.
     * 
     * The stacking order of the widget relative to other HTML elements. Uses a
     * base value for the half-axis, multiplied according to the Generation.
     */
    $: zIndex =
        offsetsByHalfAxisId[halfAxisId][2]
        * (generationId * 2 - 1)

    /**
     * Widget width.
     * 
     * The width of the widget before rotating it based on the half-axis. Takes
     * into account whether the Relationship Cohort is on a vertical or
     * horizontal axis.
     */
    $: widgetWidth =
        [1, 2].includes(halfAxisId) ? relationshipsWidth :
        relationshipsLength

    /**
     * Widget height.
     * 
     * The height of the widget before rotating it based on the half-axis. Takes
     * into account whether the Relationship Cohort is on a vertical or
     * horizontal axis.
     */
    $: widgetHeight =
        [1, 2].includes(halfAxisId) ? relationshipsLength :
        relationshipsWidth


    /**
     * Opacity.
     * 
     * The opacity of the widget. Decreases with distance from the focal plane,
     * and does so quicker on the "Towards" half-axis.
     */
    $: opacity =
    1 / (
        1 + (
            distanceFromFocalPlane < 0 ? 1 :
            distanceFromFocalPlane > 0 ? 2 :
            0
        ) * Math.abs(distanceFromFocalPlane)
    )

    /**
     * Rotated width.
     * 
     * The width of the widget after rotating it based on the half-axis. Takes
     * into account whether the Relationship Cohort is on a vertical or
     * horizontal axis.
     */
    $: rotatedWidth = [1, 2].includes(halfAxisId) ? widgetWidth : widgetHeight

    /**
     * Rotated height.
     * 
     * The height of the widget after rotating it based on the half-axis. Takes
     * into account whether the Relationship Cohort is on a vertical or
     * horizontal axis.
     */
    $: rotatedHeight = [1, 2].includes(halfAxisId) ? widgetHeight : widgetWidth

    /**
     * Mirroring.
     * 
     * Whether the content of the widget is flipped relative to the Graph
     * centerline, determined by the half-axis.
     */
    $: mirroring = mirroringByHalfAxisId[halfAxisId]
    
    /**
     * Rotation.
     * 
     * The rotation of the widget, determined by the half-axis.
     */
    $: rotation = rotationByHalfAxisId[halfAxisId]


    /**
     * Show-Direction flag.
     * 
     * This attribute determines whether to show the Direction selector widget.
     * The widget is shown when the Generation is 0 or the mouse is hovered over
     * the Relationship stem. However, if the associated Thing is being hovered,
     * the widget is not shown (because in that case the Direction should be
     * displayed on the Relationship branch widget instead of the stem).
     */
    $: showDirection =
        (parentThing.address.generationId === 0 || stemHovered) && !thingIdOfHoveredRelationship ? true :
        false

    /**
     * Direction.
     * 
     * The Direction of the Relationships Cohort. Retrieved by Direction ID from
     * the store.
     */
    $: direction = getGraphConstructs("Direction", cohort.address.directionId as number) as Direction

    /**
     * Direction widget rotation.
     * 
     * This specifies how much the Direction widget should be rotated, taking
     * into account the rotation and mirroring of the widgets into which it is
     * embedded as well as the Relationship Cohort's half-axis.
     */
    $: directionWidgetRotation = 
        -rotation * mirroring
        + (
            halfAxisId === 3 ? -90 :
            halfAxisId === 4 ? 90 :
            0
        )

    /**
     * Change-Relationships-Direction method.
     * 
     * Accepts a Direction ID as input, then changes the Direction of all the
     * Relationships in the Relationship Cohort to that Direction.
     */
    changeRelationshipsDirection = async (directionId: number) => {
        // Get the IDs of the source Thing and all the destination Things.
        const sourceThingId = parentThing.id
        const destThingIds = cohort.members.map(member => member.thingId)

        // Construct an array containing informational objects for each Relationship.
        const relationshipInfos: {
            sourceThingId: number,
            destThingId: number,
            directionId: number
        }[] = []
        for (const destThingId of destThingIds) relationshipInfos.push({
            sourceThingId: sourceThingId,
            destThingId: destThingId,
            directionId: directionId
        })

        // Update the Relationships based on the Relationship info array.
        const relationshipsUpdated = await updateRelationships(relationshipInfos)

        // Update the Graph to reflect the updated Relationships.
        if (relationshipsUpdated) {
            // Re-store the source Thing (so that its related Things will be updated).
            await storeGraphDbModels<ThingDbModel>("Thing", sourceThingId, true)
            // Re-build and refresh the Graph.
            await graph.build()
            addGraphIdsNeedingViewerRefresh(graph.id)
        }
    }

    /**
     * Relationships Width.
     * 
     * The width of the Relationship Cohort widget, taking into account the
     * number of Relationships in the Relationship Cohort as well as the half-
     * axis and the spacing between each Thing in a Thing Cohort.
     */
    $: relationshipsWidth =
        Math.max(cohort.members.length, 1)
        * (
            [1, 2].includes(halfAxisId) ? thingWidth :
            thingHeight
        )
        + (Math.max(cohort.members.length, 1) - 1)
        * graphWidgetStyle.betweenThingSpacing

    /**
     * Relationships Length.
     * 
     * The length (edge-to-edge distance from the source Thing to the destination
     * Thing) of the Relationship Cohort widget, taking into account the number
     * of Relationships in the Relationship Cohort as well as the half-axis and
     * the spacing between each Thing in a Thing Cohort.
     */
    $: relationshipsLength =
        graphWidgetStyle.relationDistance - (
            [1, 2].includes(halfAxisId) ? thingHeight :
            thingWidth
        ) * cohort.axialElongation

    /**
     * Tweened scale.
     * 
     * A version of the Graph widget scale that is smoothly interpolated for
     * zooming.
     */
    tweenedScale = tweened(
        1,
        {duration: 100, easing: cubicOut}
    )
    $: tweenedScale.set(scale)

    /**
     * Midline.
     * 
     * The horizontal location of the Relationship stem midline, before the
     * rotation based on the half-axis. 
     */
    $: midline = relationshipsWidth * 0.5 - offsetToGrandparentThing()

    /**
     * Stem bottom.
     * 
     * The vertical location of the bottom of the Relationship stem, before
     * the rotation based on the half-axis. 
     */
    $: stemBottom = relationshipsLength

    /**
     * Stem top.
     * 
     * The vertical location of the top of the Relationship stem, before the
     * rotation based on the half-axis. 
     */
    $: stemTop = relationshipsLength * 2/3

    /**
     * Show-relationships flag.
     * 
     * This attribute determines whether to show the Relationships branch widgets
     * (though not the Relationship stem widget). It is true unless the only
     * member of the associated Thing Cohort is a looped-back grandparent Thing.
     */
    $: showRelationships = !(/////////////////////////////////////////////////////////// HERE IS THE PROBLEM.
        cohort.members.length === 1
        && cohort.indexOfGrandparentThing !== null
    )

    /**
     * Half-axis ID.
     * 
     * The ID of the half-axis the Relationship Cohort is on. Taken from the
     * associated Thing Cohort's attribute.
     */
    $: halfAxisId = cohort.halfAxisId

    /**
     * Size of Things along width.
     * 
     * This refers to the size of a Thing widget along the "width" dimension of
     * its Thing Cohort widget, which may be horizontal or vertical depending on
     * the half-axis.
     */
    $: sizeOfThingsAlongWidth =
        [1, 2].includes(halfAxisId) ? thingWidth :
        thingHeight

    
    /* --------------- Supporting attributes. --------------- */

    /**
     * X offset.
     * 
     * The horizontal offset of the widget relative to its Clade, before rotation
     * based on the half-axis. Does not take the offset of the grandparent Thing
     * into account.
     */
    $: xOffset = 0.5 * graphWidgetStyle.relationDistance * offsetsByHalfAxisId[halfAxisId][0]

    /**
     * Y offset.
     * 
     * The vertical offset of the widget relative to its Clade, before rotation
     * based on the half-axis. Does not take the offset of the grandparent Thing
     * into account.
     */
    $: yOffset = 0.5 * graphWidgetStyle.relationDistance * offsetsByHalfAxisId[halfAxisId][1]

    /**
     * X offset to grandparent Thing.
     * 
     * The horizontal offset of the Relationship Cohort's root Thing to its
     * grandparent Thing. Taken from the associated Thing Cohort's attribute if
     * the half-axis is arranged as a row. Otherwise is 0.
     */
    $: xOffsetToGrandparentThing =
        cohort.rowOrColumn() === "row" ? offsetToGrandparentThing() :
        0

    /**
     * Y offset to grandparent Thing.
     * 
     * The vertical offset of the Relationship Cohort's root Thing to its
     * grandparent Thing. Taken from the associated Thing Cohort's attribute if
     * the half-axis is arranged as a column. Otherwise is 0.
     */
    $: yOffsetToGrandparentThing =
        cohort.rowOrColumn() === "column" ? offsetToGrandparentThing() :
        0

    /**
     * Generation ID.
     * 
     * The ID of the Generation the Relationship Cohort is in. Taken from the
     * associated Thing Cohort's attribute.
     */
    $: generationId = cohort.address.generationId

    /**
     * Distance from focal Plane.
     * 
     * The number of Planes between the Plane the Relationship Cohort is in and
     * the Graph's current focal Plane.
     */
    $: distanceFromFocalPlane = planeId - graph.planes.focalPlaneId

    /**
     * Parent Thing.
     * 
     * The Thing which is at the root of the Relationships in this Relationship
     * Cohort. Taken from the associated Thing Cohort's attribute. Assumed to be
     * a Thing, rather than null, since Relationship Cohort Widgets are only
     * "spawned" from Clades (which in turn always have root Things).
     */
    $: parentThing = cohort.parentThing as Thing
    
    /**
     * Offset to grandparent Thing.
     * 
     * This is distance from left and top edge of the Relationship Cohort widget
     * to the midline of the grandparent Thing if it is included in the
     * Relationship Cohort. (Defaults to 0 otherwise.)
     */
    function offsetToGrandparentThing(): number {
        // If there is no grandparent Thing or the Generation is the last,
        // Relationships-only Generation, default to 0.
        if (
            cohort.indexOfGrandparentThing === null
            || cohort.isInRelationshipsOnlyGeneration
        ) {
            return 0
        // Otherwise,
        } else {
            // The first part of the offset is...
            // ...the difference between the index of the grandparent Thing
            // (as represented in the associated Thing Cohort) and the halfway
            // index of the associated Thing Cohort...
            const part1 = (
                (cohort.members.length - 1) / 2
                - cohort.indexOfGrandparentThing
            )
            // ...multiplied by either the Thing width or height (depending on
            // the half-axis) plus the spacing between Things in the Thing
            // Cohort.
            * (
                (
                    [1, 2].includes(halfAxisId) ? thingWidth :
                    thingHeight
                )
                + graphWidgetStyle.betweenThingSpacing
            )

            // The second part of the offset is 0 if the half-axis is 0 or if
            // the half-axis is its own opposite. Otherwise it is the sum of the
            // space each Thing takes up in the Thing Cohort, times the Thing
            // Cohort's parent Thing's index in its own Thing Cohort.
            const part2 = (
                halfAxisId !== 0
                && halfAxisId === halfAxisOppositeIds[halfAxisId] ? (
                    (sizeOfThingsAlongWidth + graphWidgetStyle.betweenThingSpacing)
                    * parentThing.address.indexInCohort
                ) :
                0
            )

            // Return the sum of the two parts.
            const offsetToGrandparentThing = part1 + part2
            return offsetToGrandparentThing
        }
    }
    
    /**
     * Plane ID.
     * 
     * The ID of the Plane that the Relationship Cohort is in. Taken from the
     * associated Thing Cohort's attribute (defaults to 0 if there is none).
     */
    $: planeId = cohort.plane?.id || 0
    
    /**
     * Scale.
     * 
     * The HTML scale of the Graph widget. Derived from a base value, then
     * exponentially modified by the Graph widget's zoom factor.
     */
    $: scale = zoomBase ** graphWidgetStyle.zoom

    /**
     * Relationship color.
     * 
     * The color of the Relationship widget, determined by the half-axis.
     */
    $: relationshipColor = relationshipColorByHalfAxisId[halfAxisId]
</script>