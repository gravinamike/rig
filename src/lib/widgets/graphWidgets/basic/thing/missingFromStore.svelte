<script lang="ts">
    import type { GraphWidgetModel, ThingMissingFromStoreWidgetModel } from "$lib/models/widgetModels"
    import { planePadding } from "$lib/shared/constants"

    export let model: ThingMissingFromStoreWidgetModel
    export let graphWidgetModel: GraphWidgetModel


    /* Variables situating the Thing in its spatial context (Half-Axis, Plane). */
    $: planeId = model.planeId

    /* Variables dealing with encapsulation (Things containing other Things). */
    // If the Half-Axis is "Outwards, or the Thing has "Inwards" children, it is encapsulating.
    $: encapsulatingDepth = model.encapsulatingDepth
    $: encapsulatingPadding = encapsulatingDepth >= 0 ? 40 : 20

    /* Variables dealing with Thing sizing. */
    $: xYElongation = model.xYElongation

    $: cohortSize = model.cohortSize
    $: thingSize = graphWidgetModel.style.thingSize + planePadding * planeId + encapsulatingPadding * encapsulatingDepth
    $: thingWidth = thingSize * xYElongation.x
    $: thingHeight = encapsulatingDepth >= 0 ? thingSize * xYElongation.y : thingSize * xYElongation.y / cohortSize - 2
</script>


<main class="thing-missing-from-store-widget">
    <div
        class="box"
        style="width: {thingWidth}px; height: {thingHeight}px;"
    >
        THING {model.thingId} MISSING FROM STORE
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