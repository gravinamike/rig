<script lang="ts">
    import { hoveredThingIdStore } from "$lib/stores"
    import type { HalfAxisId } from "$lib/shared/constants"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"

    // Import widget controller.
    import ThingAlreadyRenderedWidgetController from "./controller.svelte"
    

    export let thingId: number
    export let cohortHalfAxisId: HalfAxisId | 0
    export let graphWidgetStyle: GraphWidgetStyle


    let hoveredThingIdStoreValue: number | null = null
    hoveredThingIdStore.subscribe(value => {hoveredThingIdStoreValue = value})


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
    {cohortHalfAxisId}
    {graphWidgetStyle}

    bind:encapsulatingDepth
    bind:thingWidth
    bind:thingHeight
    bind:overlapMarginStyleText
    bind:relationshipColor
    bind:isHoveredThing
/>



<div
    class="thing-outline-already-rendered-widget"
>
    <div
        class="box"
        style="
            {overlapMarginStyleText}
            {
                thingId === hoveredThingIdStoreValue ?
                    `border: solid 1px ${relationshipColor}; border-style: dashed; ` :
                    ""
            }
            border-radius: {10 + 4 * encapsulatingDepth}px;
            width: {thingWidth}px; height: {thingHeight}px;
        "

        on:mouseenter={()=>{hoveredThingIdStore.set(thingId)}}
        on:mouseleave={()=>{hoveredThingIdStore.set(null)}}
    />
</div>


<style>
    .box {
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