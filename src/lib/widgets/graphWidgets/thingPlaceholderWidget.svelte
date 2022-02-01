<script lang="ts">
    import type { ThingPlaceholderWidgetModel } from "$lib/models/widgetModels"
    import type { Graph } from "$lib/models/graphModels"
    import { planePadding } from "$lib/shared/constants"

    export let thingPlaceholderWidgetModel: ThingPlaceholderWidgetModel
    export let graph: Graph


    /* Variables situating the Thing in its spatial context (Half-Axis, Plane). */
    $: planeId = thingPlaceholderWidgetModel.planeId

    /* Variables dealing with encapsulation (Things containing other Things). */
    // If the Half-Axis is "Outwards, or the Thing has "Inwards" children, it is encapsulating.
    $: encapsulatingDepth = thingPlaceholderWidgetModel.encapsulatingDepth
    $: encapsulatingPadding = encapsulatingDepth >= 0 ? 40 : 20

    /* Variables dealing with Thing sizing. */
    $: xYElongation = thingPlaceholderWidgetModel.xYElongation

    $: cohortSize = thingPlaceholderWidgetModel.cohortSize
    $: thingSize = graph.graphWidgetStyle.thingSize + planePadding * planeId + encapsulatingPadding * encapsulatingDepth
    $: thingWidth = thingSize * xYElongation.x
    $: thingHeight = encapsulatingDepth >= 0 ? thingSize * xYElongation.y : thingSize * xYElongation.y / cohortSize - 2
</script>


<main class="thing-placeholder-widget">
    <div
        class="box"
        style="width: {thingWidth}px; height: {thingHeight}px;"
    >
        PLACEHOLDER FOR THING {thingPlaceholderWidgetModel.thingId}
    </div>
</main>


<style>
    .box {
        width: 50px;
        height: 50px;
        padding: 1rem;
        font-size: 0.35rem;
        font-weight: 400;
        border-radius: 10px;
        border-color: green;
    }
</style>