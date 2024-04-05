<script lang="ts">
    // Import types.
    import type { Graph, Thing } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"

    // Import stores.
    import { hoveredThingIdStore } from "$lib/stores"

    // Import widget controller.
    import ThingAlreadyRenderedWidgetController from "./controller.svelte"
    


    export let thingId: number
    export let thing: Thing | null
    export let graphWidgetStyle: GraphWidgetStyle
    


    // Attributes managed by the widget controller.
    let encapsulatingDepth = 0
    let thingWidth = 0
    let thingHeight= 0
    let overlapMarginStyleText = ""
    let relationshipColor = "#000000"
    let isHoveredThing = false
</script>


<!-- Widget controller. -->
<ThingAlreadyRenderedWidgetController
    {thingId}
    {thing}
    {graphWidgetStyle}

    bind:encapsulatingDepth
    bind:thingWidth
    bind:thingHeight
    bind:relationshipColor
    bind:isHoveredThing
/>


<!-- Thing-already-rendered widget (outline version). -->
<div
    class="thing-outline-already-rendered-widget"
    class:hovered-thing={thingId === $hoveredThingIdStore}
    
    style="
        {overlapMarginStyleText}
        {thingId === $hoveredThingIdStore ? `border: solid 1px ${relationshipColor};` : ""}
        border-radius: {10 + 4 * encapsulatingDepth}px;
        width: {thingWidth}px;
        height: {thingHeight}px;
    "

    on:mouseenter={()=>{hoveredThingIdStore.set(thingId)}}
    on:mouseleave={()=>{hoveredThingIdStore.set(null)}}
/>


<style>
    .thing-outline-already-rendered-widget {
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

    .thing-outline-already-rendered-widget.hovered-thing {
        border-style: dashed;
    }
</style>