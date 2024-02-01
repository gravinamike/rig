<script lang="ts">
    // Import types.
    import type { Graph, Thing } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets/graph"

    // Import stores.
    import {
        readOnlyMode, hoveredThingIdStore, hoveredRelationshipTarget,
        relationshipBeingCreatedInfoStore, setRelationshipBeingCreatedDestThingId, disableRelationshipBeingCreated
    } from "$lib/stores"

    // Import widget controller.
    import ThingWidgetController from "./controller.svelte"

    // Import related widgets.
    import { NotesViewer } from "$lib/viewers/notesViewers"
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



    // Handles for HTML element dimensions.
    let width = 1
    let height = 1

    // Attributes handled by widget controller.
    let thingWidgetId: string
    let thingWidth: number
    let thingHeight: number
    let encapsulatingDepth: number = 0
    let elongationCategory: "vertical" | "horizontal" | "neutral"
    let isEncapsulating: boolean
    let textFontSize: number
    let highlighted: boolean
    let isHoveredWidget: boolean
    let relatableForCurrentDrag: boolean
    let showDeleteButton: boolean
    let confirmDeleteBoxOpen: boolean
    let handleMouseDown: (event: MouseEvent | TouchEvent) => void
    let handleMouseDrag: (event: MouseEvent | TouchEvent) => void
    let onBodyMouseUp: (event: MouseEvent | TouchEvent) => void
    let openCommandPalette: (event: MouseEvent) => void
    let startDelete: () => void
    let completeDelete: () => void






    const showThingText = true
    const showNote = !graph.offAxis
</script>


<ThingWidgetController
    {thingId}
    bind:thing
    {graph}
    {graphWidgetStyle}
    {isHoveredWidget}
    {rePerspectToThingId}

    bind:thingWidgetId
    bind:highlighted
    bind:encapsulatingDepth
    bind:thingWidth
    bind:thingHeight
    bind:elongationCategory
    bind:isEncapsulating
    bind:textFontSize
    bind:relatableForCurrentDrag
    bind:showDeleteButton
    bind:confirmDeleteBoxOpen
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
        class="thing-outline-widget"
        class:box={graph.offAxis}
        class:off-axis={graph.offAxis}
        class:highlighted

        bind:clientWidth={width}
        bind:clientHeight={height}

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
            class:box={!graph.offAxis}
        >
            <div
                class="thing-text"
                class:encapsulating={isEncapsulating}

                style="font-size: {(graph.offAxis ? 1: 0.75) * textFontSize}px;"
            >
                {thing.text}
            </div>
        </div>

        {#if showNote}
            <NotesViewer
                {graph}
                {thing}
                outlineFormat={true}
                fullSize={false}
                {rePerspectToThingId}
            />
        {/if}

        <!-- Delete controls. -->
        <DeleteWidget
            {showDeleteButton}
            {confirmDeleteBoxOpen}
            thingWidth={width}
            thingHeight={height}
            {encapsulatingDepth}
            trashIcon={true}
            {startDelete}
            {completeDelete}
        />
    </div>
{/if}


<style>
    .thing-outline-widget {        
        position: relative;

        padding: 1rem;

        pointer-events: auto;
    }

    .thing-outline-widget:not(.off-axis) {
        display: flex;
        flex-direction: column;
        padding: 0.25rem;
        gap: 0.25rem;
    }







    .highlighted {
        outline: solid 2px black;
        outline-offset: -2px;
    }

    .box {
        outline: solid 0.25px lightgrey;
        outline-offset: -0.25px;
        border-radius: 5px;

        height: max-content;
        background-color: white;

        padding: 1rem;

        cursor: default;
    }

    .thing-outline-widget:not(.off-axis) .box {
        padding: 0.25rem;
    }

    .text-container {
        width: 100%;

        text-align: left;
    }

    .thing-outline-widget:not(.off-axis) .text-container {
        position: relative;
        height: 15px;
    }

    .thing-text {
        margin-left: 0.5rem;

        position: absolute;
        left: 50%;
        top: 50%;
        width: 100%; 
        transform: translate(-50%, -50%);

        white-space: nowrap;
        font-weight: 600;
    }

    .thing-outline-widget:not(.off-axis) .thing-text {
        margin-left: 0.35rem;
    }

    .thing-text.encapsulating {
        position: absolute;
        transform: translate(0%, -50%);

        white-space: nowrap;
    }
</style>