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
     * @param thingId - The ID of the Thing the widget is based on.
     * @param cohortHalfAxisId - The half-axis of the Thing Cohort the Thing is part of.
     * @param graphWidgetStyle - Controls the style of the Graph widget.
     * @param encapsulatingDepth - The number of encapsulations between the Perspective Thing and the Thing.
     * @param thingWidth - The width of the Thing widget.
     * @param thingHeight - The height of the Thing widget.
     * @param relationshipColor - The color of the Relationship from the parent Thing to this Thing.
     * @param isHoveredThing - Whether the mouse is hovered over the Thing (or another widget representing the same Thing).
     */
    export let thingId: number
    export let cohortHalfAxisId: HalfAxisId
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle

    export let encapsulatingDepth: number
    export let thingWidth: number
    export let thingHeight: number
    export let relationshipColor: string
    export let isHoveredThing: boolean

    export let thing: Thing | null


    // Attributes managed by the base widget controller.
    let halfAxisId: HalfAxisId


    /* --------------- Output attributes. --------------- */

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
    /*$: overlapMargin =
        thingCohortExpanded ? graphWidgetStyle.betweenThingOverlap / 2 :
        - graphWidgetStyle.thingSize / 2*/
</script>


<!-- Base Thing widget controller. -->
<ThingBaseWidgetController
    {thing}
    {graph}
    {graphWidgetStyle}

    bind:encapsulatingDepth
    bind:thingWidth
    bind:thingHeight
    bind:halfAxisId
/>