<script lang="ts">
    /* Type imports. */
    import type { Graph, Thing } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"

    /* Store imports. */
    import {
        graphDbModelInStore, unstoreGraphDbModels,
        hoveredThingIdStore, hoveredRelationshipTarget,
        relationshipBeingCreatedInfoStore, enableRelationshipBeingCreated,
        setRelationshipBeingCreatedDestThingId, setRelationshipBeingCreatedTrackingMouse,
        disableRelationshipBeingCreated,
        pinIdsStore, openContextCommandPalette, addPin, removePin,
        removeIdsFromThingSearchListStore,
        reorderingInfoStore
    } from "$lib/stores"

    // Utility imports.
    import { hexToRgba } from "$lib/shared/utility"

    /* Widget imports. */
    import { ThingDetailsWidget } from "$lib/widgets/detailsWidgets"
    import { relationshipColorByHalfAxisId, type HalfAxisId } from "$lib/shared/constants"
    import { XButton, ConfirmDeleteBox } from "$lib/widgets/layoutWidgets"
    import ThingWidgetController from "./controller.svelte"


    /**
     * @param  {number} thingId - The ID of the Thing the widget is based on.
     * @param  {Graph} graph - The Graph that the Thing is in.
     * @param  {(thingId: number) => Promise<void>} rePerspectToThingId - A function that re-perspects the Graph to a given Thing ID.
     */
    export let thingId: number
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle
    export let rePerspectToThingId: (id: number) => Promise<void>
    export let thingWidth: number
    export let thingHeight: number 


    let planeId: number
    let encapsulatingDepth: number = 0
    let thingSize: number
    let xYElongation: {x: number, y: number}
    let cohortSize: number = 0
    let thing: Thing
    let halfAxisId: HalfAxisId
    let elongationCategory: "vertical" | "horizontal" | "neutral"
    let thingWidgetId: string
    let isEncapsulating: boolean
    let relatableForCurrentDrag: boolean
    let distanceFromFocalPlane: number





    
    /* Variables dealing with visual formatting of the Thing itself (color, opacity, outline, etc.). */
    $: opacity = [7, 8].includes(halfAxisId) ?
        1 :
        1 / (1 + (distanceFromFocalPlane < 0 ? 1 : (distanceFromFocalPlane > 0 ? 2 : 0)) * Math.abs(distanceFromFocalPlane))
    $: shadowColor = relationshipColorByHalfAxisId[halfAxisId]
    let isHoveredWidget = false
    $: isHoveredThing = thingId === $hoveredThingIdStore
    $: relationshipBeingCreated = $relationshipBeingCreatedInfoStore.sourceThingId ? true : false
    $: highlighted = isHoveredThing && !(relationshipBeingCreated && !relatableForCurrentDrag) && !$reorderingInfoStore.reorderInProgress ? true : false

    /* Variables dealing with visual formatting of the Thing's text. */
    let textFontSize = encapsulatingDepth >= 0 ?
        graphWidgetStyle.thingTextSize :
        graphWidgetStyle.thingTextSize / Math.log2(cohortSize)

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
        await unstoreGraphDbModels("Thing", thingId)

        const reverseHistory = graph.history._entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        for (const historyEntry of reverseHistory) {
            if (historyEntry.thingId !== thingId && graphDbModelInStore("Thing", historyEntry.thingId)) {
                rePerspectToThingId(historyEntry.thingId)
                break
            }
        }

        await removeIdsFromThingSearchListStore(thingId)
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



    
    
    let dragStartPosition: [number, number] | null = null

    function handleMouseDown(event: MouseEvent) {
        const position = [event.clientX, event.clientY] as [number, number]
        dragStartPosition = position
        setRelationshipBeingCreatedTrackingMouse(true)
    }

    function handleMouseDrag(event: MouseEvent) {
        if (
            dragStartPosition
            && Math.hypot(event.clientX - dragStartPosition[0], event.clientX - dragStartPosition[0]) > 5
            && !$relationshipBeingCreatedInfoStore.sourceThingId
        ) {
            enableRelationshipBeingCreated(
                graph,
                graphWidgetStyle,
                thingId,
                opacity,
                halfAxisId,
                thing.parentCohort.direction,
                [event.clientX, event.clientY]
            )
        }
    }

    function onBodyMouseUp(event: MouseEvent) {
        if (event.button === 0) handleBodyMouseUp()
    }

    function handleBodyMouseUp() {
        dragStartPosition = null
    }
</script>


<ThingWidgetController
    {thingId}
    {graph}
    {graphWidgetStyle}

    bind:planeId
    bind:encapsulatingDepth
    bind:thingSize
    bind:thingWidth
    bind:thingHeight
    bind:xYElongation
    bind:cohortSize

    bind:thingWidgetId
    bind:thing
    bind:halfAxisId
    bind:elongationCategory
    bind:isEncapsulating
    bind:relatableForCurrentDrag
    bind:distanceFromFocalPlane
/>













<svelte:body
    on:mousemove={handleMouseDrag}
    on:mouseup={onBodyMouseUp}
/>


<!-- Thing Widget. -->
{#if thing}
    <div
        id="{thingWidgetId}"
        class="box thing-widget" class:highlighted
        style="
            border-radius: {10 + 4 * encapsulatingDepth}px;
            {isHoveredThing && !(relationshipBeingCreated && !relatableForCurrentDrag) && !$reorderingInfoStore.reorderInProgress ? 
                `box-shadow: 5px 5px 10px 10px ${hexToRgba(shadowColor, 0.15)};` :
                `box-shadow: 5px 5px 10px 2px ${hexToRgba(shadowColor, 0.15)};`
            }
            width: {thingWidth}px; height: {thingHeight}px; opacity: {opacity};
            pointer-events: {
                distanceFromFocalPlane === 0 && !(relationshipBeingCreated && !relatableForCurrentDrag) ?
                    "auto" :
                    "none"
            };
        "

        on:mouseenter={()=>{
            hoveredThingIdStore.set(thingId)
            isHoveredWidget = true, hoveredRelationshipTarget.set(thing)
        }}
        on:mouseleave={()=>{
            hoveredThingIdStore.set(null)
            isHoveredWidget = false
            confirmDeleteBoxOpen = false, hoveredRelationshipTarget.set(null)
        }}
        on:mousedown={ event => {if (event.button === 0) {
            handleMouseDown(event)
        }}}
        on:click={ () => {if ($relationshipBeingCreatedInfoStore.sourceThingId === null) rePerspectToThingId(thingId) } }
        on:mouseup={ () => {
            if (relatableForCurrentDrag) {
                setRelationshipBeingCreatedDestThingId(thingId)
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
                {thing.text}
            </div>
        </div>

        <!-- Content box. -->
        {#if showContent && thing.dbModel}
            <div 
                class="content-box"
                class:horizontal={elongationCategory === "horizontal"}
                class:vertical={!(elongationCategory === "horizontal")}
            >
                <ThingDetailsWidget
                    thingDbModel={thing.dbModel}
                    freestanding={false}
                />
            </div>
        {/if}

        <!-- Delete button and confirm delete dialog. -->
        {#if isHoveredWidget && !$reorderingInfoStore.reorderInProgress && !confirmDeleteBoxOpen}
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
{/if}


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