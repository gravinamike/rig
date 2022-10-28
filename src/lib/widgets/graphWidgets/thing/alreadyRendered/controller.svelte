<script lang="ts">
    // Import types.
    import type { HalfAxisId } from "$lib/shared/constants"
    import type { Graph, Thing } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"

    // Import constants.
    import { relationshipColorByHalfAxisId } from "$lib/shared/constants"

    // Import stores.
    import { hoveredThingIdStore } from "$lib/stores"

    // Import base widget controller.
    import { ThingBaseWidgetController } from "../base"


    /**
     * Create a Thing-already-rendered widget controller.
     * @param {number | null} thingId - The ID of the Thing the widget is based on.
     * @param {HalfAxisId} cohortHalfAxisId - The half-axis of the Thing Cohort the Thing is part of.
     * @param {GraphWidgetStyle} graphWidgetStyle - Controls the style of the Graph widget.
     * @param {number} encapsulatingDepth - The number of encapsulations between the Perspective Thing and the Thing.
     * @param {number} thingWidth - The width of the Thing widget.
     * @param {number} thingHeight - The height of the Thing widget.
     * @param {string} overlapMarginStyleText - The CSS text to handle the overlap between the widgets.
     * @param {string} relationshipColor - The color of the Relationship from the parent Thing to this Thing.
     * @param {boolean} isHoveredThing - Whether the mouse is hovered over the Thing (or another widget representing the same Thing).
     */
    export let thingId: number
    export let cohortHalfAxisId: HalfAxisId
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle

    export let encapsulatingDepth: number
    export let thingWidth: number
    export let thingHeight: number
    export let overlapMarginStyleText: string
    export let relationshipColor: string
    export let isHoveredThing: boolean


    // Attributes managed by the base widget controller.
    let halfAxisId: HalfAxisId
    let thing: Thing | null


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
        !thing || !thing.parentCohort ? "" :
        // If there is only 1 Thing in the Thing Cohort, use an empty string (no formatting).
        thing.parentCohort.members.length === 1 ? "" :
        // Else, if the Thing is the first in the Thing Cohort, use only a right or bottom overlap margin.
        thing.address.indexInCohort === 0 ? (
            rowOrColumn === "row" ? `margin-right: ${overlapMargin}px;` :
            `margin-bottom: ${overlapMargin}px;`
        ) :
        // Else, if the Thing is the last in the Thing Cohort, use only a left or top overlap margin.
        thing.address.indexInCohort === thing.parentCohort.members.length - 1 ? (
            rowOrColumn === "row" ? `margin-left: ${overlapMargin}px;` :
            `margin-top: ${overlapMargin}px;`
        // Else, use overlap margins on both sides (left/right or top/bottom).
        ) : (
            rowOrColumn === "row" ? `margin-left: ${overlapMargin}px; margin-right: ${overlapMargin}px;` :
            `margin-top: ${overlapMargin}px; margin-bottom: ${overlapMargin}px;`
        )

    /**
     * Relationship color.
     * 
     * The color of the Relationship widget from the parent Thing to this Thing,
     * based on the half-axis of that Relationship. Used for formatting parts of
     * the Thing widget whose color is matched to that of the Relationship.
     */
    $: relationshipColor = relationshipColorByHalfAxisId[halfAxisId]

    /**
     * Is-hovered-Thing flag.
     * 
     * This attribute indicates whether the mouse is hovering over the Thing,
     * either directly over the Thing widget associated with this controller, or
     * over another widget representing the same Thing.
     */
    $: isHoveredThing = thingId === $hoveredThingIdStore ? true : false


    /* --------------- Supporting attributes. --------------- */

    /**
     * Row-or-column attribute.
     * 
     * Indicates whether the Thing's Thing Cohort is arranged as a row or a
     * column.
     */
    $: rowOrColumn = [1, 2].includes(cohortHalfAxisId) ? "row" : "column"
    
    /**
     * Overlap margin.
     * 
     * Provides the number of pixels by which the Thing should overlap its
     * neighbors in the Thing Cohort.
     */
    $: overlapMargin = graphWidgetStyle.betweenThingOverlap / 2
</script>


<!-- Base Thing widget controller. -->
<ThingBaseWidgetController
    {thingId}
    {graph}
    {graphWidgetStyle}

    bind:encapsulatingDepth
    bind:thingWidth
    bind:thingHeight
    bind:halfAxisId
    bind:thing
/>