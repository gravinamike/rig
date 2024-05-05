<script lang="ts">
    // Import types.
    import type { Editor } from "@tiptap/core"
    import type { Graph, Thing } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets/graph"

    // Import stores.
    import {
        titleFontStore, titleFontWeightStore, thingColorStore, lightenOrDarkenColorString,
        preventEditing, hoveredThingIdStore, hoveredRelationshipTarget,
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
     * @param editingNotes - Whether any Notes for this outliner are currently in editing mode.
     * @param notesEditor - The Notes TipTap editor for this Thing.
     * @param rePerspectToThingId - A function that re-perspects the Graph to a given Thing ID.
     */
    export let thingId: number
    export let thing: Thing | null = null
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle
    export let outlineScrollAreaTop: number
    export let outlineScrollTime: Date | null
    export let editingNotes: boolean
    export let notesEditor: Editor | null
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

    let editingNoteForThisThing = false





    function onThingMouseEnter() {
        hoveredThingIdStore.set(thingId)
        isHoveredWidget = true, hoveredRelationshipTarget.set(thing)
    }

    function onThingMouseLeave() {
        hoveredThingIdStore.set(null)
        isHoveredWidget = false
        confirmDeleteBoxOpen = false, hoveredRelationshipTarget.set(null)
    }

    function onThingClick() {
        if (
            graph.offAxis
            && $relationshipBeingCreatedInfoStore.sourceThingId === null
        ) rePerspectToThingId(thingId)
    }

    function onThingMouseUp() {
        if (relatableForCurrentDrag) {
            setRelationshipBeingCreatedDestThingId(thingId)
        } else {
            disableRelationshipBeingCreated()
        }
    }

    function onThingTouchEnd() {
        if (relatableForCurrentDrag) {
            setRelationshipBeingCreatedDestThingId(thingId)
        } else {
            disableRelationshipBeingCreated()
        }
    }

    const onThingContextMenu = (event: MouseEvent) => {
        if (!$preventEditing) openCommandPalette(
            [event.clientX, event.clientY]
        )
    }










    





    let thingOutlineWidget: HTMLElement | null = null

    let thingTextContainerStickyOffset = 0




    function getThingTextContainerStickyOffset() {
        const relationshipsOutlineWidgetTop = thingOutlineWidget?.getBoundingClientRect().top ?? 0
        const thingTextContainerStickyOffset =
            Math.min(
                Math.max(
                    outlineScrollAreaTop - relationshipsOutlineWidgetTop + (
                        // Allowance for Thing name widgets of the previous Generations.
                        24 * ((thing?.address?.generationId ?? 0) - 1)
                    ),
                    0
                ),
                (thingOutlineWidget?.parentElement?.parentElement?.getBoundingClientRect().height ?? 0) - 28
            )
        console.log(thing?.text, thingTextContainerStickyOffset)
        return thingTextContainerStickyOffset
    }

    $: {
        outlineScrollTime

        thingTextContainerStickyOffset = getThingTextContainerStickyOffset()
    }


    $: thingTextContainerZIndex = 15 - (thing?.address?.generationId ?? 0)



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
        class:editing-note={editingNoteForThisThing}

        bind:this={thingOutlineWidget}
        bind:clientWidth={width}
        bind:clientHeight={height}

        style="background-color: {
            highlighted ? lightenOrDarkenColorString($thingColorStore, "darker", 5) :
            $thingColorStore
        };"

        on:mouseenter={onThingMouseEnter}
        on:mouseleave={onThingMouseLeave}
        on:mousedown={ event => {if (event.button === 0) {}}}
        on:touchstart={()=>{}}
        on:click={onThingClick}
        on:keydown={()=>{}}
        on:mouseup={onThingMouseUp}
        on:touchend={onThingTouchEnd}
        on:contextmenu|preventDefault={onThingContextMenu}
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
                bind:editing={editingNoteForThisThing}
                bind:outlinerIsEditing={editingNotes}
                bind:editor={notesEditor}
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
                    {
                        !graph.offAxis ? `top: ${4 + thingTextContainerStickyOffset}px; z-index: ${thingTextContainerZIndex};` :
                        ""
                    }
                    



                    font-family: {$titleFontStore || "Arial"};
                    font-weight: {$titleFontWeightStore ?? 600};
                    background-color: {
                        highlighted ? lightenOrDarkenColorString($thingColorStore, "darker", 4) :
                        $thingColorStore
                    };
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
        {#if !$preventEditing}
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
        {/if}
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

    .thing-outline-widget.editing-note {
        z-index: 1;
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

        padding: 1rem;

        cursor: default;
    }

    .box.highlighted {
        box-shadow: 1px 1px 2px 1px dimgrey;
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
        left: 4px;
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

        line-height: 18px;
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