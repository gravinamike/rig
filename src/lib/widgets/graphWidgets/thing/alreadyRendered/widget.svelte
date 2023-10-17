<script lang="ts">
    // Import types.
    import type { HalfAxisId } from "$lib/shared/constants"
    import type { Graph, Thing } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"

    // Import stores.
    import { reorderingInfoStore } from "$lib/stores"

    // Import widget controller.
    import ThingAlreadyRenderedWidgetController from "./controller.svelte"
    

    /**
     * @param thingId - The ID of the Thing the widget is based on.
     * @param cohortHalfAxisId - The ID of the half-axis the Thing's Thing Cohort is on.
     * @param graph - The Graph that the Thing is part of.
     * @param graphWidgetStyle - Controls the style of the Graph widget.
     * @param thingCohortExpanded - Whether the Thing Cohort this is part of is expanded or collapsed.
     */
    export let thingId: number
    export let cohortHalfAxisId: HalfAxisId
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle

    export let getThingOverlapMarginStyleText: (
        thing: Thing,
        thingOverlapMargin: number,
        thingCohortRowOrColumn: "row" | "column"
    ) => string
    export let thingOverlapMargin: number
    export let thingCohortRowOrColumn: "row" | "column"


    // Attributes managed by the widget controller.
    let encapsulatingDepth = 0
    let thingWidth = 0
    let thingHeight = 0
    let overlapMarginStyleText = ""
    let relationshipColor = "#000000"
    let isHoveredThing = false

    let thing: Thing | null
    

    $: overlapMarginStyleText = thing ? getThingOverlapMarginStyleText(thing, thingOverlapMargin, thingCohortRowOrColumn) : ""
</script>


<!-- Widget controller. -->
<ThingAlreadyRenderedWidgetController
    {thingId}
    {cohortHalfAxisId}
    {graph}
    {graphWidgetStyle}

    bind:encapsulatingDepth
    bind:thingWidth
    bind:thingHeight
    bind:relationshipColor
    bind:isHoveredThing
    bind:thing
/>


<!-- Thing-already-rendered widget. -->
<div
    class="thing-already-rendered-widget"
    style="
        border-radius: {10 + 4 * encapsulatingDepth}px;
        {
            isHoveredThing && !$reorderingInfoStore.reorderInProgress ? `border: solid 1px ${relationshipColor}; border-style: dashed; ` :
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