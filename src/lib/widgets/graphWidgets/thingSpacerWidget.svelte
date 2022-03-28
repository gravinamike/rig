<script lang="ts">
    import { hoveredThingIdStore } from "$lib/stores"
    import type { ThingBaseWidgetModel } from "$lib/models/widgetModels"
    import type { Graph } from "$lib/models/graphModels"
    import { planePadding, relationshipColorByHalfAxisId } from "$lib/shared/constants"
    

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


    let hoveredThingIdStoreValue: number | null = null
    hoveredThingIdStore.subscribe(value => {hoveredThingIdStoreValue = value})

    // Calculate color of Relationship image.
    const halfAxisId = thingBaseWidgetModel.halfAxisId
    const relationshipColor = relationshipColorByHalfAxisId[halfAxisId]
</script>


<div
    class="thing-spacer-widget"
>
    <div
        class="box"
        style="
            {
                thingBaseWidgetModel.thingId === hoveredThingIdStoreValue ?
                    `border: solid 1px ${relationshipColor}; border-style: dashed; ` :
                    ""
            }
            border-radius: {10 + 4 * encapsulatingDepth}px;
            width: {thingWidth}px; height: {thingHeight}px;
        "
        on:mouseenter={()=>{hoveredThingIdStore.set(thingBaseWidgetModel.thingId)}}
        on:mouseleave={()=>{hoveredThingIdStore.set(null)}}
    >
        <!--SPACER FOR THING {thingBaseWidgetModel.thingId}-->
    </div>
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