<script lang="ts">
    import { hoveredThingIdStore } from "$lib/stores"
    import type { Thing } from "$lib/models/graphModels";
    import type { GraphWidgetModel, ThingBaseWidgetModel } from "$lib/models/widgetModels"
    import type { HalfAxisId } from "$lib/shared/constants"
    import { planePadding, relationshipColorByHalfAxisId } from "$lib/shared/constants"
    

    export let thingBaseWidgetModel: ThingBaseWidgetModel
    export let cohortHalfAxisId: HalfAxisId | 0
    export let graphWidgetModel: GraphWidgetModel


    /* Variables situating the Thing in its spatial context (Half-Axis, Plane). */
    $: planeId = thingBaseWidgetModel.planeId

    /* Variables dealing with encapsulation (Things containing other Things). */
    // If the Half-Axis is "Outwards, or the Thing has "Inwards" children, it is encapsulating.
    $: encapsulatingDepth = thingBaseWidgetModel.encapsulatingDepth
    $: encapsulatingPadding = encapsulatingDepth >= 0 ? 40 : 20

    /* Variables dealing with Thing sizing. */
    $: xYElongation = thingBaseWidgetModel.xYElongation

    $: cohortSize = thingBaseWidgetModel.cohortSize
    $: thingSize = graphWidgetModel.style.thingSize + planePadding * planeId + encapsulatingPadding * encapsulatingDepth
    $: thingWidth = thingSize * xYElongation.x
    $: thingHeight = encapsulatingDepth >= 0 ? thingSize * xYElongation.y : thingSize * xYElongation.y / cohortSize - 2


    let hoveredThingIdStoreValue: number | null = null
    hoveredThingIdStore.subscribe(value => {hoveredThingIdStoreValue = value})

    // Calculate color of Relationship image.
    const halfAxisId = thingBaseWidgetModel.halfAxisId
    const relationshipColor = relationshipColorByHalfAxisId[halfAxisId]


    
    $: betweenThingOverlap = graphWidgetModel.style.betweenThingOverlap

    let overlapMarginStyleText: string
    const rowOrColumn = [1, 2].includes(cohortHalfAxisId) ? "row" : "column"
    $: if ((thingBaseWidgetModel.thing as Thing).parentCohort.members.length === 1) {
        overlapMarginStyleText = ""
    } else if ((thingBaseWidgetModel.thing as Thing).address.indexInCohort === 0) {
        overlapMarginStyleText = rowOrColumn === "row" ?
            `margin-right: ${betweenThingOverlap / 2}px;` :
            `margin-bottom: ${betweenThingOverlap / 2}px;`
    } else if ((thingBaseWidgetModel.thing as Thing).address.indexInCohort === (thingBaseWidgetModel.thing as Thing).parentCohort.members.length - 1) {
        overlapMarginStyleText = rowOrColumn === "row" ?
            `margin-left: ${betweenThingOverlap / 2}px;` :
            `margin-top: ${betweenThingOverlap / 2}px;`
    } else {
        overlapMarginStyleText = rowOrColumn === "row" ?
            `margin-left: ${betweenThingOverlap / 2}px; margin-right: ${betweenThingOverlap / 2}px;` :
            `margin-top: ${betweenThingOverlap / 2}px; margin-bottom: ${betweenThingOverlap / 2}px;`
    }
</script>


<div
    class="thing-already-rendered-widget"
>
    <div
        class="box"
        style="
            {overlapMarginStyleText}
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