<script lang="ts">
    // Import types.
    import type { Editor } from "@tiptap/core"
    import type { Graph, Thing } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets/graph"

    // Import stores.
    import {
        readOnlyMode, hoveredThingIdStore, hoveredRelationshipTarget,
        relationshipBeingCreatedInfoStore, setRelationshipBeingCreatedDestThingId, disableRelationshipBeingCreated, titleFontStore, titleFontWeightStore


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
    export let activeNotesEditorForOutliner: Editor | null
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
    let shadowColor = "grey"
    let isHoveredWidget: boolean
    let relatableForCurrentDrag: boolean
    let showDeleteButton: boolean
    let confirmDeleteBoxOpen: boolean
    let handleMouseDown: (event: MouseEvent | TouchEvent) => void
    let handleMouseDrag: (event: MouseEvent | TouchEvent) => void
    let onBodyMouseUp: (event: MouseEvent | TouchEvent) => void
    let openCommandPalette: (position: [number, number]) => void
    let startDelete: () => void
    let completeDelete: () => void






    const showThingText = true
    const showNote = !graph.offAxis



    $: isRootClade = thingId === graph.rootCohort?.members[0].thing?.id



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
    {shadowColor}
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
        on:click={ () => {
            if (
                graph.offAxis
                && $relationshipBeingCreatedInfoStore.sourceThingId === null
            ) rePerspectToThingId(thingId)
        } }
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
        on:contextmenu|preventDefault={ (event) => {if (!$readOnlyMode) openCommandPalette(
            [event.clientX, event.clientY]
        )} }
    >
        {#if showNote}
            <!-- If this is the root Thing in a Thing outliner, expand the bottom by 1 pixel to
            make the borders align correctly. -->
            {#if isRootClade}
                <div class="root-clade-extender" />
            {/if}

            <!-- Note viewer. -->
            <NotesViewer
                {graph}
                bind:thing
                outlineFormat={true}
                makeRoomForThingText={!isRootClade}
                fullSize={false}
                bind:activeNotesEditorForOutliner
                {rePerspectToThingId}
            />
        {/if}

        <!-- Thing text. -->
        {#if !isRootClade}
            <div
                class="text-container"
                class:box={!graph.offAxis}
                class:highlighted

                style="
                    font-family: {$titleFontStore || "Arial"};
                    font-weight: {$titleFontWeightStore ?? 600};
                "

                on:click={ () => {
                    if ($relationshipBeingCreatedInfoStore.sourceThingId === null) rePerspectToThingId(thingId)
                } }
                on:keydown={()=>{}}
            >
                <div
                    class="thing-text"
                    class:encapsulating={isEncapsulating}

                    style="font-size: {(graph.offAxis ? 1 : 0.85) * textFontSize}px;"
                >
                    {thing.text}
                </div>
            </div>
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
        margin-top: -1px;

        padding: 0rem;
    }

    .root-clade-extender {
        width: 100%;
        height: 1px;
    }

    .box {
        box-shadow: 1px 1px 1px 0px silver;
        outline: solid 0.25px lightgrey;
        outline-offset: -0.25px;
        border-radius: 2px;

        height: max-content;
        background-color: white;

        padding: 1rem;

        cursor: default;
    }

    .box.highlighted {
        box-shadow: 1px 1px 2px 1px silver;

        background-color: #f7f7f7;
    }

    .thing-outline-widget:not(.off-axis) .box {
        padding: 0.25rem;
    }

    .text-container {
        box-sizing: border-box;

        width: 100%;

        text-align: left;
    }


    .thing-outline-widget:not(.off-axis) .text-container {
        position: absolute;
        left: 5px;
        top: 5px;
        width: unset;
        height: 20px;

        padding: 0 0.25rem 0 0.25rem;
    }

    .thing-text {
        margin-left: 0.5rem;

        position: absolute;
        left: 50%;
        top: 50%;
        width: 100%; 
        transform: translate(-50%, -50%);

        white-space: nowrap;
    }

    .thing-outline-widget:not(.off-axis) .thing-text {
        margin-left: 0;

        position: relative;
        left: 0;
        top: 0;
        width: unset;
        transform: unset;
    }

    .thing-text.encapsulating {
        position: absolute;
        transform: translate(0%, -50%);

        white-space: nowrap;
    }
</style>