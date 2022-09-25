<script lang="ts">
    // Import types.
    import type { Tweened } from "svelte/motion"
    import type { HalfAxisId } from "$lib/shared/constants"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"
    import type { Graph, GenerationMember, ThingCohort } from "$lib/models/constructModels"

    // Import constants and utility functions.
    import { mirroringByHalfAxisId, zoomBase } from "$lib/shared/constants"
    import { rectOfThingWidgetByThingId } from "$lib/shared/utility"


    /**
     * @param cohortMemberWithIndex: Object containing the index and the Generation Member the widget is based on.
     * @param cohort: The Thing Cohort containing the destination Thing that the Relationship is associated with.
     * @param graph - The Graph that the Relationship is in.
     * @param graphWidgetStyle - Controls the style of the Graph widget.
     * @param midline - The horizontal mid-line position of the Relationship stem.
     * @param halfAxisId - The ID of the half-axis the Relationship is on.
     * @param thingWidth - The width of a Thing widget.
     * @param thingHeight - The height of a Thing widget.
     * @param relationshupsLength - The edge-to-edge distance between the Relationship's source and destination Things.
     * @param sizeOfThingsALongWidth - The size of a Thing widget along the side-to-side dimension of the Relationship Cohort widget.
     */
    export let cohortMemberWithIndex: { index: number, member: GenerationMember }
    export let cohort: ThingCohort
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle
    export let midline: number
    export let halfAxisId: HalfAxisId
    export let thingWidth: number
    export let thingHeight: number
    export let relationshipsLength: number
    export let sizeOfThingsAlongWidth: number

    export let leafGeometry: { bottom: number, top: number, bottomMidline: number, topMidline: number } | null
    export let tweenedScale: Tweened<number>


    /* --------------- Output attributes. --------------- */

    /**
     * Leaf geometry.
     * 
     * The geometry of the Relationship Leaf, including the bottom and top
     * (vertical) positions and the midline (horizontal) positions for the
     * bottom and top.
     */
    $: leafGeometry =
        // If the Thing is already rendered in the Graph,
        cohortMemberWithIndex.member.alreadyRendered ? {
            // The Leaf is collapsed to a point with the same bottom and top
            // coordinate. This is calculated starting at the bottom of the
            // widget (which is the "full length", since the coordinate system
            // starts at the top)./////////////////////////////////////////////////// MORE ON THIS.
            bottom: (
                relationshipsLength
                + 0.5 * sizeOfThingsAlongLength
                + 0.5 * offsetAlongLength * flip
            ),
            top: (
                relationshipsLength
                + 0.5 * sizeOfThingsAlongLength
                + 0.5 * offsetAlongLength * flip
            ),
            // The Leaf midline starts from the Relationship Cohort midline, and
            // is displaced half the way towards///////////////////////////////////////////// MORE ON THIS.
            bottomMidline: (
                midline
                + 0.5 * offsetAlongWidth
            ),
            topMidline: (
                midline
                + 0.5 * offsetAlongWidth
            )
        } :
        // Otherwise, for a first-time-rendered Thing,
        {
            // The top of the leaf is the top of the widget (which is the 0
            // point, since the coordinates start at the top), and the bottom
            // of the leaf is 1/3 of the way towards the source Thing.
            bottom: relationshipsLength * 1/3,
            top: 0,
            // The midlines (both bottom and top) are the "default" values,
            // which are used when a Thing is in its typical position in the
            // Thing Cohort rather than somewhere else already rendered.
            bottomMidline: defaultLeafMidline,
            topMidline: defaultLeafMidline
        }
    
    /**
     * Tweened scale.
     * 
     * When animated zooming is enabled, the tweened scale provides a smoothly
     * interpolated version of the discrete scale.
     */
    $: tweenedScale.set(scale)



    /* --------------- Support attributes. --------------- */
    
    /**
     * Size of Things along Relationship Cohort length.
     * 
     * This is the size of Thing widgets along whichever dimension is parallel
     * to the length dimension of the Relationship Cohort after rotation. It is
     * determined by the half-axis.
     */
    $: sizeOfThingsAlongLength = (
        [1, 2].includes(halfAxisId) ? thingHeight :
        thingWidth
    )

    /**
     * Offset of related Thing along Relationship Cohort length.
     * 
     * This is the offset to the related Thing along whichever dimension is
     * parallel to the length dimension of the Relationship Cohort after
     * rotation. It is determined by the half-axis.
     */
    $: offsetAlongLength =
        [1, 2].includes(halfAxisId) ? offsetsOfRelatedThing.y :
        offsetsOfRelatedThing.x

    /**
     * Offset of related Thing along Relationship Cohort width.
     * 
     * This is the offset to the related Thing along whichever dimension is
     * perpendicular to the length dimension of the Relationship Cohort after
     * rotation. It is determined by the half-axis.
     */
    $: offsetAlongWidth =
        [1, 2].includes(halfAxisId) ? offsetsOfRelatedThing.x :
        offsetsOfRelatedThing.y

    /**
     * Flip.
     * 
     * Whether to flip the offset to the related Thing based on the mirroring.
     * Determined by the half-axis.
     */
    $: flip =
        [1, 2].includes(halfAxisId) ? mirroringByHalfAxisId[halfAxisId] :
        -mirroringByHalfAxisId[halfAxisId]

    /**
     * Default Leaf midline.
     * 
     * The horizontal midline position to be used when a Thing is in its typical
     * position in the Thing Cohort rather than somewhere else already rendered.
     */
    $: defaultLeafMidline = (
        // The sum of half of a Thing's size...
        0.5 * sizeOfThingsAlongWidth
        // ...plus the sum of a Thing's size and the spacing between Things...
        + (
            sizeOfThingsAlongWidth
            + graphWidgetStyle.betweenThingSpacing
        )
        // ...multiplied by the index of the associated Thing in its Thing Cohort.
        * cohortMemberWithIndex.index
    )

    /**
     * Scale.
     * 
     * The HTML scale of the Graph widget. Derived from a base value, then
     * exponentially modified by the Graph widget's zoom factor.
     */
    $: scale = zoomBase ** graphWidgetStyle.zoom


    /**
     * X and Y offsets of related Thing.
     * 
     * The horizontal and vertical distances between the start of the
     * Relationship and the related Thing. Used for "non-default" Leaf geometries
     * when the destination Thing is already rendered in the Graph.
     */
    $: offsetsOfRelatedThing = getOffsetsOfRelatedThing(cohortMemberWithIndex.member, scale)

    /**
     * Get-offsets-of-related-Thing method.
     * 
     * Retrieves the horizontal and vertical distances between the start of the
     * Relationship and the related Thing, based on the coordinates of the HTML
     * element of the Thing widget if it exists.
     * 
     * @param member - The Generation Member for the related Thing.
     * @param scale - The current Scale of the Graph.
     * @returns - An {x, y} object with the horizontal and vertical offsets.
     */
    function getOffsetsOfRelatedThing(member: GenerationMember, scale: number): {x: number, y: number} {
        // Get location of the Relationship's source Thing Widget.
        const parentDomRect = rectOfThingWidgetByThingId(graph.id, cohort.parentThingId as number)
        const parentRectX = parentDomRect === null ? 0 : parentDomRect.x
        const parentRectY = parentDomRect === null ? 0 : parentDomRect.y

        // Get position of the Relationship's destination Thing Widget.
        const relatedRect = rectOfThingWidgetByThingId(graph.id, member.thingId)
        const relatedRectX = relatedRect === null ? 0 : relatedRect.x
        const relatedRectY = relatedRect === null ? 0 : relatedRect.y

        // Return the component offsets (the differences between the two).
        const offsetLengthX = (relatedRectX - parentRectX) / scale
        const offsetLengthY = (relatedRectY - parentRectY) / scale
        return {x: offsetLengthX, y: offsetLengthY}
    }
</script>