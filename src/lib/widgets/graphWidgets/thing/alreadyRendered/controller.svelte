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
     * @param thingId - The ID of the Thing the widget is based on.
     * @param thing - The Thing the widget is based on.
     * @param graphWidgetStyle - Controls the style of the Graph widget.
     * @param thingCohortRowOrColumn - Whether the Thing Cohort that this is a member of is arranged horizontally or vertically.
     * @param thingOverlapMargin - How much sibling Things should overlap each other, in pixels.
     * @param getThingOverlapMarginStyleText - Method to generate the text that implements the overlap of sibling Things through the CSS margin property.
     * @param encapsulatingDepth - The number of encapsulations between the Perspective Thing and the Thing.
     * @param thingWidth - The width of the Thing widget.
     * @param thingHeight - The height of the Thing widget.
     * @param overlapMarginStyleText - The CSS style text that implements the overlap effect between sibling Things.
     * @param relationshipColor - The color of the Relationship from the parent Thing to this Thing.
     * @param isHoveredThing - Whether the mouse is hovered over the Thing (or another widget representing the same Thing).
     */
    export let thingId: number
    export let thing: Thing | null
    export let graphWidgetStyle: GraphWidgetStyle
    export let thingCohortRowOrColumn: "row" | "column" = "row"
    export let thingOverlapMargin: number = 0
    export let getThingOverlapMarginStyleText: (
        thing: Thing,
        thingOverlapMargin: number,
        thingCohortRowOrColumn: "row" | "column"
    ) => string = () => ""

    export let encapsulatingDepth: number
    export let thingWidth: number
    export let thingHeight: number
    export let overlapMarginStyleText: string = ""
    export let relationshipColor: string
    export let isHoveredThing: boolean



    // Attributes managed by the base widget controller.
    let halfAxisId: HalfAxisId


    
    /* --------------- Output attributes. --------------- */

    /**
     * Overlap-margin style text.
     * 
     * The CSS style text that implements the overlap effect between sibling Things.
     */
    $: overlapMarginStyleText =
        thing ? getThingOverlapMarginStyleText(thing, thingOverlapMargin, thingCohortRowOrColumn) :
        ""

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
</script>


<!-- Base Thing widget controller. -->
<ThingBaseWidgetController
    {thing}
    {graphWidgetStyle}

    bind:encapsulatingDepth
    bind:thingWidth
    bind:thingHeight
    bind:halfAxisId
/>