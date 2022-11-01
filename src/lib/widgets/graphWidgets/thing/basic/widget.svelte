<script lang="ts">
    /* Type imports. */
    import type { Graph, Thing } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"

    /* Store imports. */
    import {
        hoveredThingIdStore, hoveredRelationshipTarget,
        relationshipBeingCreatedInfoStore, setRelationshipBeingCreatedDestThingId,
        disableRelationshipBeingCreated
    } from "$lib/stores"

    // Utility imports.
    import { hexToRgba } from "$lib/shared/utility"

    /* Widget imports. */
    import { ThingDetailsWidget } from "$lib/widgets/detailsWidgets"
    import { XButton, ConfirmDeleteBox } from "$lib/widgets/layoutWidgets"
    import ThingWidgetController from "./controller.svelte"


    /**
     * @param thingId - The ID of the Thing the widget is based on.
     * @param graph - The Graph that the Thing is in.
     * @param rePerspectToThingId - A function that re-perspects the Graph to a given Thing ID.
     */
    export let thingId: number
    export let thing: Thing | null = null
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle
    export let rePerspectToThingId: (id: number) => Promise<void>
    export let thingWidth: number
    export let thingHeight: number 


    // Attributes handled by the widget controller.
    let thingWidgetId: string
    let highlighted: boolean
    let shadowColor ="#000000"
    let encapsulatingDepth: number = 0
    let opacity: number
    let showPointer: boolean
    let isHoveredWidget = false
    let confirmDeleteBoxOpen: boolean
    let relatableForCurrentDrag: boolean
    const showContent = false // Content is in development - so `showContent` will eventually be a variable.
    let elongationCategory: "vertical" | "horizontal" | "neutral"
    let isEncapsulating: boolean
    let textFontSize: number
    let showDeleteButton: boolean
    let handleMouseDown: (event: MouseEvent) => void
    let handleMouseDrag: (event: MouseEvent) => void
    let onBodyMouseUp: (event: MouseEvent) => void
    let openCommandPalette: (event: MouseEvent) => void
    let startDelete: () => void
    let completeDelete: () => void
</script>


<!-- Widget controller. -->
<ThingWidgetController
    {thingId}
    {thing}
    {graph}
    {graphWidgetStyle}
    {isHoveredWidget}
    {rePerspectToThingId}

    bind:thingWidgetId
    bind:highlighted
    bind:shadowColor
    bind:encapsulatingDepth
    bind:thingWidth
    bind:thingHeight
    bind:opacity
    bind:showPointer
    bind:confirmDeleteBoxOpen
    bind:relatableForCurrentDrag
    bind:elongationCategory
    bind:isEncapsulating
    bind:textFontSize
    bind:showDeleteButton
    bind:handleMouseDown
    bind:handleMouseDrag
    bind:onBodyMouseUp
    bind:openCommandPalette
    bind:startDelete
    bind:completeDelete
/>


<!-- Set up mouse-event handlers on page body. -->
<svelte:body
    on:mousemove={handleMouseDrag}
    on:mouseup={onBodyMouseUp}
/>


<!-- Thing Widget. -->
{#if thing}
    <div
        id="{thingWidgetId}"
        class="thing-widget"
        class:highlighted

        style="
            border-radius: {10 + 4 * encapsulatingDepth}px;
            {
                highlighted ? `box-shadow: 5px 5px 10px 10px ${hexToRgba(shadowColor, 0.15)};` :
                `box-shadow: 5px 5px 10px 2px ${hexToRgba(shadowColor, 0.15)};`
            }
            width: {thingWidth}px; height: {thingHeight}px;
            opacity: {opacity};
            pointer-events: {
                showPointer ? "auto" :
                "none"
            };
        "

        on:mouseenter={ ()=>{
            hoveredThingIdStore.set(thingId)
            isHoveredWidget = true, hoveredRelationshipTarget.set(thing)
        } }
        on:mouseleave={ ()=>{
            hoveredThingIdStore.set(null)
            isHoveredWidget = false
            confirmDeleteBoxOpen = false, hoveredRelationshipTarget.set(null)
        } }
        on:mousedown={ event => {
            if (event.button === 0) {
                handleMouseDown(event)
            }
        } }
        on:click={ () => {
            if ($relationshipBeingCreatedInfoStore.sourceThingId === null) rePerspectToThingId(thingId)
        } }
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

            style="
                width: { Math.min(thingWidth, thingHeight) }px;
                height: { Math.min(thingWidth, thingHeight) }px;
            "
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
        {#if showDeleteButton}
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
    .thing-widget {
        outline: solid 0.25px lightgrey;
        outline-offset: -0.25px;

        position: relative;
        box-sizing: border-box;
        height: max-content;
        background-color: white;

        pointer-events: auto;
        cursor: default;
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