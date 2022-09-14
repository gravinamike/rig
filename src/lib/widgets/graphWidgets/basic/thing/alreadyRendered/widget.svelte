<script lang="ts">
    // Import types.
    import type { Thing } from "$lib/models/constructModels"
    import type { HalfAxisId } from "$lib/shared/constants"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"

    // Import stores.
    import { hoveredThingIdStore } from "$lib/stores"

    // Import widget controller.
    import ThingAlreadyRenderedWidgetController from "./controller.svelte"
    

    /**
     * Create a Thing-Already-Rendered widget.
     * @param {number | null} thingId - The ID of the Thing the widget is based on.
     * @param {HalfAxisId} cohortHalfAxisId - The ID of the half-axis the Thing's Thing Cohort is on.
     * @param {GraphWidgetStyle} graphWidgetStyle - Controls the style of the Graph widget.
     */
    export let thingId: number
    export let cohortHalfAxisId: HalfAxisId
    export let graphWidgetStyle: GraphWidgetStyle


    // Attributes managed by the widget controller.
    let encapsulatingDepth: number
    let thingWidth: number
    let thingHeight: number
    let overlapMarginStyleText: string
    let relationshipColor: string
    let isHoveredThing: boolean    
</script>


<!-- Widget controller. -->
<ThingAlreadyRenderedWidgetController
    {thingId}
    {cohortHalfAxisId}
    {graphWidgetStyle}

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
            isHoveredThing ? `border: solid 1px ${relationshipColor}; border-style: dashed; ` :
            ""
        }
        width: {thingWidth}px;
        height: {thingHeight}px;
        {overlapMarginStyleText}
    "

    on:mouseenter={ ()=>{hoveredThingIdStore.set(thingId)} }
    on:mouseleave={ ()=>{hoveredThingIdStore.set(null)} }
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

        pointer-events: auto;
    }
</style>