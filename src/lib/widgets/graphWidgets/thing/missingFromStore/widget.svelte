<script lang="ts">
    // Import types.
    import type { Graph } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"

    // Import constants.
    import ThingMissingFromStoreWidgetController from "./controller.svelte"
    

    export let thingId: number
    export let graphWidgetStyle: GraphWidgetStyle


    let planeId: number = 0
    let encapsulatingDepth: number = 0
    let xYElongation: {x: number, y: number} = {x: 0, y: 0}
    let cohortSize: number = 0


    /* Variables dealing with encapsulation (Things containing other Things). */
    // If the Half-Axis is "Outwards, or the Thing has "Inwards" children, it is encapsulating.
    $: encapsulatingPadding = encapsulatingDepth >= 0 ? 40 : 20

    /* Variables dealing with Thing sizing. */
    $: thingSize = graphWidgetStyle.thingSize + encapsulatingPadding * encapsulatingDepth
    $: thingWidth = thingSize * xYElongation.x
    $: thingHeight = encapsulatingDepth >= 0 ? thingSize * xYElongation.y : thingSize * xYElongation.y / cohortSize - 2
</script>



<ThingMissingFromStoreWidgetController
    {graphWidgetStyle}

    bind:encapsulatingDepth
    bind:thingSize
    bind:thingWidth
    bind:thingHeight
    bind:xYElongation
    bind:cohortSize
/>



<div class="thing-missing-from-store-widget">
    <div
        class="box"
        style="width: {thingWidth}px; height: {thingHeight}px;"
    >
        THING {thingId} MISSING FROM STORE
    </div>
</div>


<style>
    .box {
        width: 50px;
        height: 50px;
        padding: 1rem;
        font-size: 0.35rem;
        font-weight: 400;
        border-radius: 10px;
        border-color: green;

        text-align: center;
    }
</style>