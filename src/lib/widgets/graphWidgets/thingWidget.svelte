<script lang="ts">
    /* Type imports. */
    import type { Thing } from "$lib/models/dbModels"
    import type { Graph } from "$lib/models/graphModels"
    import type { ThingWidgetModel } from "$lib/models/widgetModels"

    /* Widget imports. */
    import { pinIdsStore, hoveredThingIdStore, openContextCommandPalette, addPin, removePin } from "$lib/stores"
    import { ThingDetailsWidget } from "$lib/widgets/detailsWidgets"
    import { planePadding, relationshipColorByHalfAxisId } from "$lib/shared/constants"
    import { XButton, ConfirmDeleteBox } from "$lib/widgets/layoutWidgets"

    import { hexToRgba } from "$lib/shared/utility"


    export let thingWidgetModel: ThingWidgetModel
    export let graph: Graph
    export let rePerspectToThingId: (id: number) => Promise<void>

    
    const showContent = true
    let confirmDeleteBoxOpen = false

    /* Basic Thing IDs and models. */
    $: thingId = thingWidgetModel.thingId as number
    $: thingWidgetId = thingWidgetModel.thingWidgetId
    $: thing = thingWidgetModel.thing as Thing

    /* Variables situating the Thing in its spatial context (Half-Axis, Plane). */
    $: halfAxisId = thingWidgetModel.halfAxisId
    $: planeId = thingWidgetModel.planeId
    $: distanceFromFocalPlane = planeId - graph.focalPlaneId
    
    /* Variables dealing with encapsulation (Things containing other Things). */
    // If the Half-Axis is "Outwards, or the Thing has "Inwards" children, it is encapsulating.
    $: isEncapsulating = thingWidgetModel.isEncapsulating
    $: encapsulatingDepth = thingWidgetModel.encapsulatingDepth
    $: encapsulatingPadding = encapsulatingDepth >= 0 ? 40 : 20

    /* Variables dealing with Thing sizing. */
    $: elongationCategory = thingWidgetModel.elongationCategory
    $: xYElongation = thingWidgetModel.xYElongation

    $: cohortSize = thingWidgetModel.cohortSize
    $: thingSize = graph.graphWidgetStyle.thingSize + planePadding * planeId + encapsulatingPadding * encapsulatingDepth
    $: thingWidth = thingSize * xYElongation.x
    $: thingHeight = encapsulatingDepth >= 0 ? thingSize * xYElongation.y : thingSize * xYElongation.y / cohortSize - 2
    
    // Variables dealing with visual formatting (color, opacity, outline, etc.).
    $: opacity = [7, 8].includes(halfAxisId) ?
        1 :
        1 / (1 + (distanceFromFocalPlane < 0 ? 1 : (distanceFromFocalPlane > 0 ? 2 : 0)) * Math.abs(distanceFromFocalPlane))
    let hoveredThingIdStoreValue: number | null
    hoveredThingIdStore.subscribe(value => {hoveredThingIdStoreValue = value})
    $: isHoveredThing = thingId === hoveredThingIdStoreValue
    let isHoveredWidget = false
    $: shadowColor = relationshipColorByHalfAxisId[halfAxisId]

    // Variables dealing with text formatting.
    let textFontSize = encapsulatingDepth >= 0 ?
        graph.graphWidgetStyle.thingTextSize :
        graph.graphWidgetStyle.thingTextSize / Math.log2(cohortSize)

    
    async function startDelete() {
        confirmDeleteBoxOpen = true
    }

    async function confirmDelete() {
        await graph.deleteThingById(thingId)
        graph = graph // Needed for reactivity.
    }

    function openCommandPalette(event: MouseEvent) {
        const position = [event.clientX, event.clientY] as [number, number]
        const buttonInfos = $pinIdsStore.includes(thingId) ?
            [{ text: "Remove Thing from Pins", iconName: "no-pin", onClick: () => {removePin(thingId)} }] :
            [{ text: "Add Thing to Pins", iconName: "pin", onClick: () => {addPin(thingId)} }]
        openContextCommandPalette(position, buttonInfos)
    }
</script>


<!-- Thing Widget. -->
<div
    id="{thingWidgetId}"
    class="box thing-widget { isHoveredThing ? "hovered-thing" : "" }"
    style="
        border-radius: {10 + 4 * encapsulatingDepth}px;
        {isHoveredThing ? 
            `box-shadow: 5px 5px 10px 10px ${hexToRgba(shadowColor, 0.15)};` :
            `box-shadow: 5px 5px 10px 2px ${hexToRgba(shadowColor, 0.15)};`
        }
        width: {thingWidth}px; height: {thingHeight}px; opacity: {opacity};
        pointer-events: {distanceFromFocalPlane === 0 ? "auto" : "none"};
    "
    on:mouseenter={()=>{hoveredThingIdStore.set(thingId); isHoveredWidget = true}}
    on:mouseleave={()=>{hoveredThingIdStore.set(null); isHoveredWidget = false; confirmDeleteBoxOpen = false}}
    on:click={ () => { rePerspectToThingId(thingId) } }
    on:contextmenu|preventDefault={openCommandPalette}
>
    <!-- Thing text. -->
    <div
        class="text-container { showContent && elongationCategory === "horizontal" ? "sideways" : "" }"
        style="width: { Math.min(thingWidth, thingHeight) }px; height: { Math.min(thingWidth, thingHeight) }px;"
    >
        <div
            class="thing-text { isEncapsulating ? "encapsulating" : "" } { showContent ? "show-content" : "hide-content" }"
            style="font-size: {textFontSize}px;"
        >
            {thingWidgetModel.text}
        </div>
    </div>

    <!-- Content box. -->
    {#if showContent}
        <div 
            class="content-box { elongationCategory === "horizontal" ? "horizontal" : "vertical" }"
        >
            <ThingDetailsWidget
                {thing}
                freestanding={false}
            />
        </div>
    {/if}

    <!-- Delete button and confirm delete dialog. -->
    {#if isHoveredWidget && !confirmDeleteBoxOpen}
        <div class="delete-button-container">
            <XButton
                buttonFunction={startDelete}
            />
        </div>
    {/if}
    {#if confirmDeleteBoxOpen}
        <ConfirmDeleteBox
            {thingWidth}
            {thingHeight}
            {encapsulatingDepth}
            {elongationCategory}
            confirmDeleteFunction={confirmDelete}
        />
    {/if}
</div>


<style>
    .box {
        outline: solid 0.25px lightgrey;
        outline-offset: -0.25px;

        box-sizing: border-box;
        height: max-content;
        background-color: white;

        cursor: default;
    }

    .thing-widget {
        position: relative;

        pointer-events: auto;
    }

    .thing-widget:hover {
        z-index: 1;
    }

    .hovered-thing {
        outline: solid 2px black;
        outline-offset: -2px;
    }

    .text-container {
        left: 0;
        
        text-align: center;
    }

    .text-container.sideways {
        transform: rotate(-90deg);
    }

    .thing-text {
        font-weight: 600;
    }

    .thing-text.encapsulating {
        position: absolute;
        transform: translate(0%, -50%);

        white-space: nowrap;
    }

    .thing-text.show-content {
        text-align: center;
    }

    .thing-text.hide-content {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        
        overflow-wrap: break-word;
    }

    .delete-button-container {
        position: absolute;
        top: 3px;
        right: 3px;
        z-index: 1;
    }

    .content-box {
        outline: inset 1px lightgrey;
        outline-offset: -1px;

        position: absolute;
        background-color: white;

        overflow-x: hidden;
        overflow-y: auto;
        scrollbar-width: thin;
    }

    .content-box.horizontal {
        border-radius: 0 6px 6px 0;
        
        width: calc(100% - 50px);
        height: calc(100% - 10px);
        top: 5px;
        right: 5px;
    }

    .content-box.vertical {
        border-radius: 0 0 6px 6px;

        width: calc(100% - 10px);
        height: calc(100% - 50px);
        bottom: 5px;
        left: 5px;
    }
</style>