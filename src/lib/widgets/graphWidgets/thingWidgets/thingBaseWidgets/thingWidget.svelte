<script lang="ts">
    /* Type imports. */
    import type { ThingDbModel } from "$lib/models/dbModels"
    import type { Graph } from "$lib/models/graphModels"
    import type { ThingWidgetModel } from "$lib/models/widgetModels"

    /* Store imports. */
    import {
        graphConstructInStore, unstoreGraphConstructs,
        hoveredThingIdStore, hoveredRelationshipTarget,
        relationshipBeingCreatedInfoStore, enableRelationshipBeingCreated,
        setRelationshipBeingCreatedDestWidgetModel, disableRelationshipBeingCreated,
        pinIdsStore, openContextCommandPalette, addPin, removePin,
    } from "$lib/stores"

    // Utility imports.
    import { hexToRgba } from "$lib/shared/utility"

    /* Widget imports. */
    import { ThingDetailsWidget } from "$lib/widgets/detailsWidgets"
    import { relationshipColorByHalfAxisId } from "$lib/shared/constants"
    import { XButton, ConfirmDeleteBox } from "$lib/widgets/layoutWidgets"


    /**
     * @param  {ThingWidgetModel} thingWidgetModel - The Thing Widget Model used to set up this Widget.
     * @param  {Graph} graph - The Graph that the Thing is in.
     * @param  {(thingId: number) => Promise<void>} rePerspectToThingId - A function that re-perspects the Graph to a given Thing ID.
     */
    export let thingWidgetModel: ThingWidgetModel
    export let graph: Graph
    export let rePerspectToThingId: (id: number) => Promise<void>


    /* Basic Thing IDs and models. */
    $: thingId = thingWidgetModel.thingId as number
    $: thingWidgetId = thingWidgetModel.thingWidgetId
    $: thing = thingWidgetModel.thing as ThingDbModel

    /* Variables situating the Thing in its spatial context (Half-Axis, Plane). */
    $: halfAxisId = thingWidgetModel.halfAxisId
    $: planeId = thingWidgetModel.planeId
    $: distanceFromFocalPlane = planeId - graph.planes.focalPlaneId
    
    /* Variables dealing with Thing sizing. */
    $: elongationCategory = thingWidgetModel.elongationCategory
    $: cohortSize = thingWidgetModel.cohortSize
    $: thingWidth = thingWidgetModel.thingWidth
    $: thingHeight = thingWidgetModel.thingHeight

    /* Variables dealing with encapsulation (Things containing other Things). */
    $: isEncapsulating = thingWidgetModel.isEncapsulating
    $: encapsulatingDepth = thingWidgetModel.encapsulatingDepth
    
    /* Variables dealing with visual formatting of the Thing itself (color, opacity, outline, etc.). */
    $: opacity = [7, 8].includes(halfAxisId) ?
        1 :
        1 / (1 + (distanceFromFocalPlane < 0 ? 1 : (distanceFromFocalPlane > 0 ? 2 : 0)) * Math.abs(distanceFromFocalPlane))
    $: shadowColor = relationshipColorByHalfAxisId[halfAxisId]
    let isHoveredWidget = false
    $: isHoveredThing = thingId === $hoveredThingIdStore
    $: relationshipBeingCreated = $relationshipBeingCreatedInfoStore.sourceWidgetModel ? true : false
    $: relatableForCurrentDrag = thingWidgetModel.relatableForCurrentDrag($relationshipBeingCreatedInfoStore)
    $: highlighted = isHoveredThing && !(relationshipBeingCreated && !relatableForCurrentDrag) ? true : false

    /* Variables dealing with visual formatting of the Thing's text. */
    let textFontSize = encapsulatingDepth >= 0 ?
        graph.graphWidgetStyle.thingTextSize :
        graph.graphWidgetStyle.thingTextSize / Math.log2(cohortSize)

    /* Variables dealing with associated components. */
    const showContent = false // Content is in development - so `showContent` will eventually be a variable.
    let confirmDeleteBoxOpen = false

    
    /**
     * Initiate a delete operation (which needs to be confirmed to finish).
     */
    async function startDelete() {
        confirmDeleteBoxOpen = true
    }

    /**
     * Complete a delete operation after it has been confirmed.
     */
    async function completeDelete() {
        await graph.deleteThingById(thingId)
        await unstoreGraphConstructs("Thing", thingId)

        const reverseHistory = graph.history._entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        for (const historyEntry of reverseHistory) {
            if (historyEntry.thingId !== thingId && graphConstructInStore("Thing", historyEntry.thingId)) {
                rePerspectToThingId(historyEntry.thingId)
                break
            }
        }
    }

    /**
     * Open a context command palette for this Thing.
     * 
     * @param  {MouseEvent} event - The right-click mouse event that triggered the context command palette.
     */
    function openCommandPalette(event: MouseEvent) {
        const position = [event.clientX, event.clientY] as [number, number]
        const buttonInfos = $pinIdsStore.includes(thingId) ?
            [{ text: "Remove Thing from Pins", iconName: "no-pin", iconHtml: null, isActive: false, onClick: () => {removePin(thingId)} }] :
            [{ text: "Add Thing to Pins", iconName: "pin", iconHtml: null, isActive: false, onClick: () => {addPin(thingId)} }]
        openContextCommandPalette(position, buttonInfos)
    }
</script>


<!-- Thing Widget. -->
<div
    id="{thingWidgetId}"
    class="box thing-widget" class:highlighted
    style="
        border-radius: {10 + 4 * encapsulatingDepth}px;
        {isHoveredThing && !(relationshipBeingCreated && !relatableForCurrentDrag) ? 
            `box-shadow: 5px 5px 10px 10px ${hexToRgba(shadowColor, 0.15)};` :
            `box-shadow: 5px 5px 10px 2px ${hexToRgba(shadowColor, 0.15)};`
        }
        width: {thingWidth}px; height: {thingHeight}px; opacity: {opacity};
        pointer-events: {distanceFromFocalPlane === 0 ? "auto" : "none"};
    "

    on:mouseenter={()=>{
        hoveredThingIdStore.set(thingId)
        isHoveredWidget = true, hoveredRelationshipTarget.set(thingWidgetModel)
    }}
    on:mouseleave={()=>{
        hoveredThingIdStore.set(null)
        isHoveredWidget = false
        confirmDeleteBoxOpen = false, hoveredRelationshipTarget.set(null)
    }}
    on:mousedown={ event => {if (event.button === 0) {
        enableRelationshipBeingCreated(
            thingWidgetModel,
            [event.clientX, event.clientY]
        )
    }}}
    on:click={ () => {if ($relationshipBeingCreatedInfoStore.sourceWidgetModel === null) rePerspectToThingId(thingId) } }
    on:mouseup={ () => {
        if (relatableForCurrentDrag) {
            setRelationshipBeingCreatedDestWidgetModel(thingWidgetModel)
        } else {
            disableRelationshipBeingCreated()
        }
    } }
    on:contextmenu|preventDefault={openCommandPalette}
>
    <!-- Thing text. -->
    <div
        class="text-container"
        class:horizontal={showContent && elongationCategory === "horizontal"}
        class:sideways={showContent && elongationCategory !== "horizontal"}
        style="width: { Math.min(thingWidth, thingHeight) }px; height: { Math.min(thingWidth, thingHeight) }px;"
    >
        <div
            class="thing-text"
            class:encapsulating={isEncapsulating}
            class:show-content={showContent}
            class:hide-content={!showContent}
            style="font-size: {textFontSize}px;"
        >
            {thingWidgetModel.text}
        </div>
    </div>

    <!-- Content box. -->
    {#if showContent}
        <div 
            class="content-box"
            class:horizontal={elongationCategory === "horizontal"}
            class:vertical={!(elongationCategory === "horizontal")}
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
            confirmDeleteFunction={completeDelete}
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

    .highlighted {
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