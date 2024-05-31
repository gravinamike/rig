<script lang="ts">
    /* Import types. */
    import type { Graph, Thing } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"

    // Import basic framework resources.
    import { onMount } from "svelte"

    /* Import stores. */
    import { preventEditing, homeThingIdStore, titleFontStore, titleFontWeightStore, thingColorStore, lightenOrDarkenColorString } from "$lib/stores"

    /* Import related widgets. */
    import ThingWidgetController from "./controller.svelte"
    import { ThingTextWidget, ThingTextFormWidget } from "../subWidgets"
    import DeleteWidget from "$lib/widgets/layoutWidgets/deleteWidget.svelte"
    import { ThingDetailsWidget } from "$lib/widgets/detailsWidgets"



    /**
     * @param thingId - The ID of the Thing the widget is based on.
     * @param thing - The Thing the widget is based on.
     * @param graph - The Graph that the Thing is in.
     * @param graphWidgetStyle - Controls the visual styling of the Graph.
     * @param thingWidth - The width of the Thing widget.
     * @param thingHeight - The height of the Thing widget.
     * @param perspectiveTexts - Object specifying texts to use for specific Things based on the Perspective Thing.
     * @param parentThingCohortExpanded - Whether the Thing's parent Thing Cohort is expanded or collapsed.
     * @param rePerspectToThingId - A function that re-perspects the Graph to a given Thing ID.
     */
    export let thingId: number
    export let thing: Thing | null = null
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle
    export let thingWidth: number
    export let thingHeight: number
    export let perspectiveTexts: {[thingId: string]: string}
    export let showAsCollapsed: boolean
    export let cladeControlsOpened = false
    export let rePerspectToThingId: (id: number) => Promise<void>

        

    //
    let thingWidgetDiv: HTMLElement
    
    // Attributes handled by the widget controller.
    let thingWidgetId: string
    let text: string
    let hasPerspectiveText = false
    let highlighted: boolean
    let shadowColor = "grey"
    let encapsulatingDepth: number = 0
    let opacity: number
    let showPointer: boolean
    let isHoveredWidget = false
    let confirmDeleteBoxOpen: boolean
    let relatableForCurrentDrag: boolean
    const showContent = false // Content is in development - so `showContent` will eventually be a variable.
    let elongationCategory: "vertical" | "horizontal" | "neutral"
    let isEncapsulating: boolean
    let showText: boolean
    let textFontSize: number
    let sliderOpen: boolean
    let sliderPercentage: number
    let showDeleteButton: boolean
    let editingText: boolean
    let textBeingEdited: string
    let perspectiveTextBeingEdited: string
    let usePerspectiveText = true
    let submitted: boolean
    let handleMouseDown: (event: MouseEvent | TouchEvent) => void
    let handleMouseDrag: (event: MouseEvent | TouchEvent) => void
    let onBodyMouseUp: (event: MouseEvent | TouchEvent) => void
    let onMouseEnter: () => void
    let onMouseLeave: () => void
    let onClick: (event: MouseEvent) => void
    let onMouseUp: () => void
    let onTouchEnd: (event: TouchEvent) => void
    let openCommandPalette: (position: [number, number]) => void
    let startDelete: () => void
    let completeDelete: () => void
    let toggleSlider: () => void
    let beginEditingText: () => void
    let submitEditedText: () => void
    let cancelEditingText: () => void

    
    // When the component first loads,
    onMount(async () => {
        // Set whether the Perspective-text slider is open.
        sliderOpen = !hasPerspectiveText || (hasPerspectiveText && !usePerspectiveText)
	})
</script>


<!-- Widget controller. -->
<ThingWidgetController
    {thingId}
    {thing}
    {graph}
    {graphWidgetStyle}
    bind:perspectiveTexts
    bind:usePerspectiveText
    {isHoveredWidget}
    {rePerspectToThingId}

    bind:thingWidgetId
    bind:text
    bind:hasPerspectiveText
    bind:highlighted
    {shadowColor}
    bind:encapsulatingDepth
    bind:thingWidth
    bind:thingHeight
    bind:opacity
    bind:showPointer
    bind:confirmDeleteBoxOpen
    bind:relatableForCurrentDrag
    bind:elongationCategory
    bind:isEncapsulating
    bind:showText
    bind:textFontSize
    bind:sliderOpen
    bind:sliderPercentage
    bind:showDeleteButton
    bind:editingText
    bind:textBeingEdited
    bind:perspectiveTextBeingEdited
    bind:handleMouseDown
    bind:handleMouseDrag
    bind:onBodyMouseUp
    bind:onMouseEnter
    bind:onMouseLeave
    bind:onClick
    bind:onMouseUp
    bind:onTouchEnd
    bind:openCommandPalette
    bind:startDelete
    bind:completeDelete
    bind:toggleSlider
    bind:beginEditingText
    bind:submitEditedText
    bind:cancelEditingText
/>


<!-- Set up mouse-event handlers on page body. -->
<svelte:body
    on:mousemove={ event => { if (!$preventEditing) handleMouseDrag(event) } }
    on:touchmove={ event => { if (!$preventEditing) handleMouseDrag(event) } }
    on:click={ _ => {cladeControlsOpened = false} }
    on:mouseup={onBodyMouseUp}
    on:touchend={onBodyMouseUp}
/>


<!-- Thing Widget. -->
{#if thing}
    <div
        id="{thingWidgetId}"
        class="thing-widget"

        bind:this={thingWidgetDiv}

        style="
            border-radius: {10 + 4 * encapsulatingDepth}px;
            {
                highlighted ? `box-shadow: 1px 1px ${showAsCollapsed ? 3 : 2}px 1px ${shadowColor};` :
                `box-shadow: 1px 1px ${showAsCollapsed ? 2 : 1}px 0px ${shadowColor};`
            }
            width: {thingWidth}px; height: {thingHeight}px;
            background-color: {
                highlighted ? lightenOrDarkenColorString($thingColorStore, "darker", 3) :
                $thingColorStore
            };
            opacity: {opacity};
            font-family: {$titleFontStore || "Arial"};
            font-weight: {$titleFontWeightStore ?? 600};
            pointer-events: {
                showPointer ? "auto" :
                "none"
            };
        "

        on:mouseenter={onMouseEnter}
        on:mouseleave={onMouseLeave}
        on:mousedown={ event => { if (event.button === 0) { handleMouseDown(event) } } }
        on:touchstart={ event => { handleMouseDown(event) } }
        on:click={ event => onClick(event) }
        on:keydown={()=>{}}
        on:mouseup={onMouseUp}
        on:touchend={ event => { onTouchEnd(event) } }
        on:contextmenu|preventDefault={ _ => {
            if (!$preventEditing) {
                const boundingRect = thingWidgetDiv.getBoundingClientRect()
                openCommandPalette(
                    [boundingRect.right, boundingRect.bottom]
                )
                cladeControlsOpened = true
            }
        } }
    >

        <!-- Perspective-text slider. -->
        {#if hasPerspectiveText || editingText}
            <!-- Slider backfield. -->
            <div
                class="slider-backfield"

                style="
                    width: {sliderPercentage}%;
                    background-color: {
                        highlighted ? lightenOrDarkenColorString($thingColorStore, "darker", 7) :
                        lightenOrDarkenColorString($thingColorStore, "darker", 4)
                    };
                "
            />

            <!-- Slider toggle. -->
            <div
                class="slider-toggle"

                style="
                    border-radius: {Math.floor(thingHeight * 0.04)}px;
                    left: {sliderPercentage + 3}%;
                    background-color: {
                        highlighted ? lightenOrDarkenColorString($thingColorStore, "darker", 3) :
                        $thingColorStore
                    };
                "

                on:click|stopPropagation={toggleSlider}
                on:keydown={()=>{}}
            />
        {/if}

        {#if showText}
            
            {#if editingText}

                <!-- Thing text form. -->
                <ThingTextFormWidget
                    id={`${thingWidgetId}-thing-change-text-field`}
                    bind:text={textBeingEdited}
                    bind:perspectiveText={perspectiveTextBeingEdited}
                    {usePerspectiveText}
                    fontSize={textFontSize}
                    {submitted}
                    submit={() => {if (!submitted) submitEditedText()}}
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
                {#if !$preventEditing}
                    <DeleteWidget
                        {showDeleteButton}
                        {confirmDeleteBoxOpen}
                        {thingWidth}
                        {thingHeight}
                        {encapsulatingDepth}
                        trashIcon={true}
                        {startDelete}
                        {completeDelete}
                    />
                {/if}

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
    
    <!-- Home-Thing indicator. -->
    {#if thingId === $homeThingIdStore}
        <div class="home-indicator">
            <img
                src="./icons/home.png"
                alt="Home indicator"
            >
        </div>
    {/if}
{/if}


<style>
    .thing-widget {
        outline: solid 0.25px lightgrey;
        outline-offset: -0.25px;

        position: relative;
        box-sizing: border-box;
        height: max-content;

        pointer-events: auto;
        cursor: default;
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
    }

    .slider-toggle {
        outline: solid 0.25px #ececec;
        outline-offset: -0.25px;
        box-shadow: 1px 1px 2px 1px gainsboro;
        

        position: absolute;
        top: 5%;
        width: 6%;
        height: 89%;

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

    .home-indicator {
        position: absolute;
        left: -20px;
        top: -20px;
        width: 40px;
        height: 40px;
    }

    .home-indicator img {
        width: 40px;
        height: 40px;
        opacity: 35%;
    }
</style>