<script lang="ts">
    import type { ThingBaseWidgetModel } from "$lib/models/widgetModels"
    import type { Graph } from "$lib/models/graphModels"
    import { planePadding } from "$lib/shared/constants"

    export let thingBaseWidgetModel: ThingBaseWidgetModel
    export let graph: Graph


    /* Variables situating the Thing in its spatial context (Half-Axis, Plane). */
    $: planeId = thingBaseWidgetModel.planeId

    /* Variables dealing with encapsulation (Things containing other Things). */
    // If the Half-Axis is "Outwards, or the Thing has "Inwards" children, it is encapsulating.
    $: encapsulatingDepth = thingBaseWidgetModel.encapsulatingDepth
    $: encapsulatingPadding = encapsulatingDepth >= 0 ? 40 : 20

    /* Variables dealing with Thing sizing. */
    $: xYElongation = thingBaseWidgetModel.xYElongation

    $: cohortSize = thingBaseWidgetModel.cohortSize
    $: thingSize = graph.graphWidgetStyle.thingSize + planePadding * planeId + encapsulatingPadding * encapsulatingDepth
    $: thingWidth = thingSize * xYElongation.x
    $: thingHeight = encapsulatingDepth >= 0 ? thingSize * xYElongation.y : thingSize * xYElongation.y / cohortSize - 2
</script>


<main class="thing-spacer-widget">
    <div
        class="box"
        style="width: {thingWidth}px; height: {thingHeight}px;"
    >
        <!--SPACER FOR THING {thingBaseWidgetModel.thingId}-->
    </div>
</main>


<style>
    .thing-spacer-widget {
        pointer-events: none;
    }

    .box {
        border: solid 1px green;
        outline-offset: -1px;

        box-sizing: border-box;
        width: 50px;
        height: 50px;
        padding: 1rem;
        font-size: 0.35rem;
        font-weight: 400;
    }
</style>