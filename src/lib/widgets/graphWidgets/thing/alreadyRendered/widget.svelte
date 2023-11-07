<script lang="ts">
    // Import types.
    import type { Graph, Thing } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"

    // Import stores.
    import { reorderingInfoStore } from "$lib/stores"

    // Import widget controller.
    import ThingAlreadyRenderedWidgetController from "./controller.svelte"
    

    /**
     * @param thingId - The ID of the Thing the widget is based on.
     * @param graph - The Graph that the Thing is part of.
     * @param graphWidgetStyle - Controls the style of the Graph widget.
     * @param thingCohortRowOrColumn - Whether the Thing Cohort that this is a member of is arranged horizontally or vertically.
     * @param thingOverlapMargin - How much sibling Things should overlap each other, in pixels.
     * @param getThingOverlapMarginStyleText - Method to generate the text that implements the overlap of sibling Things through the CSS margin property.
     */
    export let thingId: number
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle
    export let thingCohortRowOrColumn: "row" | "column"
    export let thingOverlapMargin: number
    export let getThingOverlapMarginStyleText: (
        thing: Thing,
        thingOverlapMargin: number,
        thingCohortRowOrColumn: "row" | "column"
    ) => string


    // Attributes managed by the widget controller.
    let thing: Thing | null
    let encapsulatingDepth = 0
    let thingWidth = 0
    let thingHeight = 0
    let overlapMarginStyleText = ""
    let relationshipColor = "#000000"
    let isHoveredThing = false
</script>


<!-- Widget controller. -->
<ThingAlreadyRenderedWidgetController
    {thingId}
    {graph}
    {graphWidgetStyle}
    {thingCohortRowOrColumn}
    {thingOverlapMargin}
    {getThingOverlapMarginStyleText}

    bind:thing
    bind:encapsulatingDepth
    bind:thingWidth
    bind:thingHeight
    bind:overlapMarginStyleText
    bind:relationshipColor
    bind:isHoveredThing
/>


<!-- Thing-already-rendered widget. -->
<div
    class="thing-already-rendered-widget"
    style="
        border-radius: {10 + 4 * encapsulatingDepth}px;
        {
            (
                isHoveredThing
                && !$reorderingInfoStore.reorderInProgress
            ) ? `border: solid 1px ${relationshipColor}; border-style: dashed; ` :
            ""
        }
        width: {thingWidth}px;
        height: {thingHeight}px;
        {overlapMarginStyleText}
    "
/>


<style>
    .thing-already-rendered-widget {
        outline-offset: -1px;

        box-sizing: border-box;
        width: 50px;
        height: 50px;
        opacity: 0.75;

        padding: 1rem;
        font-size: 0.35rem;
        font-weight: 400;

        pointer-events: none;
    }
</style>