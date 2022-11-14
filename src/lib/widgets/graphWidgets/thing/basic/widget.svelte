<script lang="ts">
    import { tweened } from "svelte/motion"
    import { cubicOut } from "svelte/easing"

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
    import { hexToRgba, sleep } from "$lib/shared/utility"

    /* Widget imports. */
    import { ThingTextWidget, DeleteThingWidget, ThingTextFormWidget } from "../subWidgets"
    import { ThingDetailsWidget } from "$lib/widgets/detailsWidgets"
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
    export let perspectiveTexts: {[thingId: string]: string}
    export let rePerspectToThingId: (id: number) => Promise<void>
    export let thingWidth: number
    export let thingHeight: number


    // Attributes handled by the widget controller.
    let thingWidgetId: string
    let text: string
    let hasPerspectiveText: boolean
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
    let editingText: boolean
    let textBeingEdited: string
    let usePerspectiveText: boolean
    let handleMouseDown: (event: MouseEvent) => void
    let handleMouseDrag: (event: MouseEvent) => void
    let onBodyMouseUp: (event: MouseEvent) => void
    let openCommandPalette: (event: MouseEvent) => void
    let startDelete: () => void
    let completeDelete: () => void
    let beginEditingText: () => void
    let submitEditedText: () => void
    let cancelEditingText: () => void



    
    let sliderOpen = false
    $: usePerspectiveText = !sliderOpen

    const sliderPosition = tweened( 0, { duration: 150, easing: cubicOut } )
    $: if (!sliderOpen) sliderPosition.set(0)
    $: if (sliderOpen) sliderPosition.set(100)
    $: sliderPercentage = 0.87 * $sliderPosition

    let showText = true

    async function toggleSlider() {
        console.log("foo")
        showText = false
        sliderOpen = !sliderOpen
        await sleep(150)
        showText = true
    }
</script>


<!-- Widget controller. -->
<ThingWidgetController
    {thingId}
    {thing}
    {graph}
    {graphWidgetStyle}
    {perspectiveTexts}
    {usePerspectiveText}
    {isHoveredWidget}
    {rePerspectToThingId}

    bind:thingWidgetId
    bind:text
    bind:hasPerspectiveText
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
    bind:editingText
    bind:textBeingEdited
    bind:handleMouseDown
    bind:handleMouseDrag
    bind:onBodyMouseUp
    bind:openCommandPalette
    bind:startDelete
    bind:completeDelete
    bind:beginEditingText
    bind:submitEditedText
    bind:cancelEditingText
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
        on:click={ event => {
            if (
                !editingText
                && $relationshipBeingCreatedInfoStore.sourceThingId === null
            ) {
                if (event.button === 0 && event.ctrlKey) {
                    beginEditingText()
                } else {
                    rePerspectToThingId(thingId)
                }
            }
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
        <!-- Perspective-text slider. -->
        {#if hasPerspectiveText}
            <div
                class="slider-backfield"

                style="
                    width: {sliderPercentage}%;
                "
            />

            <div
                class="slider-toggle"

                style="
                    border-radius: {Math.floor(thingHeight * 0.04)}px;
                    left: {sliderPercentage + 3}%;
                "

                on:click|stopPropagation={toggleSlider}
            />
        {/if}

        {#if showText}

            {#if editingText}

                <!-- Thing text form. -->
                <ThingTextFormWidget
                    id={`${thingWidgetId}-thing-change-text-field`}
                    bind:text={textBeingEdited}
                    submit={submitEditedText}
                    cancel={cancelEditingText}
                />

            {:else}

                <!-- Thing text. -->
                <ThingTextWidget
                    {thingWidth}
                    {thingHeight}
                    sidewaysText={showContent && elongationCategory === "horizontal"}
                    {isEncapsulating}
                    {showContent}
                    fontSize={textFontSize}
                    {text}
                />

                <!-- Delete controls. -->
                <DeleteThingWidget
                    {showDeleteButton}
                    {confirmDeleteBoxOpen}
                    {thingWidth}
                    {thingHeight}
                    {encapsulatingDepth}
                    {elongationCategory}
                    {startDelete}
                    {completeDelete}
                />

            {/if}

        {/if}
        

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

    .slider-backfield {
        border-width: 0.25px;
        outline-offset: -0.25px;
        border-style: inset;
        border-color: #fcfcfc;
        
        position: absolute;
        left: 6%;
        top: 6%;
        height: 86%;
        background-color: #fbfbfb;
    }

    .slider-toggle {
        outline: solid 0.25px #ececec;
        outline-offset: -0.25px;
        box-shadow: 1px 1px 2px 1px #ececec;
        

        position: absolute;
        top: 5%;
        width: 6%;
        height: 89%;
        background-color: white;

        cursor: pointer;
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