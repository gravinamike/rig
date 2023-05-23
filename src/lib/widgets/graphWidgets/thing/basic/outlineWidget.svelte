<script lang="ts">
    // Import types.
    import type { Graph, Thing } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets/graph"

    // Import stores.
    import {
        hoveredThingIdStore, hoveredRelationshipTarget,
        relationshipBeingCreatedInfoStore,
        setRelationshipBeingCreatedDestThingId, disableRelationshipBeingCreated,
        pinIdsStore, openContextCommandPalette, addPin, removePin, readOnlyMode,
    } from "$lib/stores"

    // Import widget controller.
    import ThingWidgetController from "./controller.svelte"

    // Import related widgets.
    import { ThingDetailsWidget } from "$lib/widgets/detailsWidgets"
    import DeleteWidget from "$lib/widgets/layoutWidgets/deleteWidget.svelte"


    /**
     * @param thingID - The ID of the Thing that this widget is based on.
     * @param thing - The Thing that this widget is based on.
     * @param graph - The Graph that the Thing is in.
     * @param graphWidgetStyle - Controls the visual style of the Graph.
     * @param rePerspectToThingId - A function that re-perspects the Graph to a given Thing ID.
     */
    export let thingId: number
    export let thing: Thing | null = null
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle
    export let rePerspectToThingId: (id: number) => Promise<void>


    // Attributes handled by widget controller.
    let encapsulatingDepth: number = 0
    let elongationCategory: "vertical" | "horizontal" | "neutral"
    let thingWidgetId: string
    let isEncapsulating: boolean
    let relatableForCurrentDrag: boolean
    let thingWidth: number
    let thingHeight: number
    let textFontSize: number
    let showDeleteButton: boolean
    let handleMouseDown: (event: MouseEvent | TouchEvent) => void
    let handleMouseDrag: (event: MouseEvent | TouchEvent) => void
    let onBodyMouseUp: (event: MouseEvent | TouchEvent) => void
    let openCommandPalette: (event: MouseEvent) => void
    let startDelete: () => void
    let completeDelete: () => void
    

    // Handles for HTML element dimensions.
    let width = 1
    let height = 1
    

    /* Variables dealing with visual formatting of the Thing itself (color, opacity, outline, etc.). */
    let isHoveredWidget = false
    $: isHoveredThing = thingId === $hoveredThingIdStore
    $: relationshipBeingCreated = false/*$relationshipBeingCreatedInfoStore.sourceWidgetModel ? true : false*/
    $: highlighted = isHoveredThing && !(relationshipBeingCreated && !relatableForCurrentDrag) ? true : false

    /* Variables dealing with associated components. */
    const showContent = false // Content is in development - so `showContent` will eventually be a variable.
    let confirmDeleteBoxOpen = false


    /**
     * Open a context command palette for this Thing.
     * 
     * @param  {MouseEvent} event - The right-click mouse event that triggered the context command palette.
     */
    openCommandPalette = (event: MouseEvent) => {
        const position = [event.clientX, event.clientY] as [number, number]
        const buttonInfos = $pinIdsStore.includes(thingId) ?
            [{ text: "Remove Thing from Pins", iconName: "no-pin", iconHtml: null, isActive: false, onClick: () => {removePin(thingId)} }] :
            [{ text: "Add Thing to Pins", iconName: "pin", iconHtml: null, isActive: false, onClick: () => {addPin(thingId)} }]
        openContextCommandPalette(position, buttonInfos)
    }
</script>


<ThingWidgetController
    {thingId}
    {graph}
    {graphWidgetStyle}
    {isHoveredWidget}
    {rePerspectToThingId}

    bind:encapsulatingDepth
    bind:thingWidth
    bind:thingHeight

    bind:confirmDeleteBoxOpen

    bind:thingWidgetId
    bind:thing
    bind:textFontSize
    bind:showDeleteButton
    bind:elongationCategory
    bind:isEncapsulating
    bind:relatableForCurrentDrag

    bind:handleMouseDown
    bind:handleMouseDrag
    bind:onBodyMouseUp
    bind:openCommandPalette
    bind:startDelete
    bind:completeDelete
/>


<!-- Thing Widget. -->
{#if thing}
    <div
        id="{thingWidgetId}"
        class="box thing-outline-widget" class:highlighted

        bind:clientWidth={width}
        bind:clientHeight={height}

        style="
            border-radius: 10px;
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
        on:mousedown={ event => {if (event.button === 0) {}}}
        on:touchstart={ () => {}}
        on:click={ () => {if ($relationshipBeingCreatedInfoStore.sourceThingId === null) rePerspectToThingId(thingId) } }
        on:keydown={()=>{}}
        on:mouseup={ () => {
            if (relatableForCurrentDrag) {
                setRelationshipBeingCreatedDestThingId(thingId)
            } else {
                disableRelationshipBeingCreated()
            }
        } }
        on:touchend={ () => {
            if (relatableForCurrentDrag) {
                setRelationshipBeingCreatedDestThingId(thingId)
            } else {
                disableRelationshipBeingCreated()
            }
        } }
        on:contextmenu|preventDefault={ (event) => {if (!$readOnlyMode) openCommandPalette(event)} }
    >
        <!-- Thing text. -->
        <div
            class="text-container"
            class:horizontal={showContent && elongationCategory === "horizontal"}
            class:sideways={showContent && elongationCategory !== "horizontal"}
            style="width: 100%;"
        >
            <div
                class="thing-text"
                class:encapsulating={isEncapsulating}
                class:show-content={showContent}
                class:hide-content={!showContent}
                style="width: 100%; font-size: {textFontSize}px;"
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

        <!-- Delete controls. -->
        <DeleteWidget
            {showDeleteButton}
            {confirmDeleteBoxOpen}
            thingWidth={width}
            thingHeight={height}
            {encapsulatingDepth}
            {elongationCategory}
            {startDelete}
            {completeDelete}
        />
    </div>
{/if}


<style>
    .box {
        outline: solid 0.25px lightgrey;
        outline-offset: -0.25px;

        height: max-content;
        background-color: white;

        cursor: default;
    }

    .thing-outline-widget {        
        position: relative;

        padding: 1rem;

        pointer-events: auto;
    }

    .highlighted {
        outline: solid 2px black;
        outline-offset: -2px;
    }

    .text-container {        
        text-align: left;
    }

    .text-container.sideways {
        transform: rotate(-90deg);
    }

    .thing-text {
        margin-left: 0.5rem;

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
        
        white-space: nowrap;
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