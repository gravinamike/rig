<script lang="ts">
    // Import types.
    import type { Editor } from "@tiptap/core"
    import type { Graph, Space } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"

    // Import SvelteKit framework resources.
    import { onMount, onDestroy } from "svelte"

    // Import stores.
    import { addGraph, landscapeOrientation, removeGraph, titleFontStore, titleFontWeightStore, uITrimColorStore, addGraphIdsNeedingViewerRefresh, preventEditing, notesEditorLockedStore, hoveredThingIdStore, lightenOrDarkenColorString, thingColorStore, relationshipBeingCreatedInfoStore } from "$lib/stores"

    // Import utility functions.
    import { onMobile, sleep, writePlainTextToClipboard } from "$lib/shared/utility"

    // Import related widgets.
    import { ThingCohortOutlineWidget, defaultGraphWidgetStyle } from "$lib/widgets/graphWidgets"
    import NotesToolbar from "$lib/viewers/notesViewers/notesToolbar.svelte"
    import { Tooltip } from "$lib/widgets/layoutWidgets"

    // Import API functions.
    import { markThingsVisited } from "$lib/db/makeChanges"
    import { saveGraphConfig } from "$lib/shared/config";
    import DepthControl from "./depthControl.svelte";
    


    export let space: Space
    export let pThingIds: (number | null)[]
    export let depth: number
    export let graphWidgetStyle: GraphWidgetStyle = {...defaultGraphWidgetStyle}
    export let offAxis = false
    export let fullSize: boolean
    export let rePerspectToThingId: (thingId: number) => Promise<void>



    
    const startingGraphWidgetStyle = {...graphWidgetStyle}




    let graphOutlineWidget: HTMLElement
    
    // Outline title (root Thing text).
    $: title =
        graph === null ? "" :
        graph.rootCohort?.members[0].thing?.text ?? "THING NOT FOUND IN STORE"



        









    let editor: Editor | null





    /**
     * Focus-editor method.
     * 
     * Gives the Tiptap editor keyboard focus.
     */
    function focusEditor() {
        if (!editor) return

        const editorElement = editor.view.dom as HTMLElement
        if (editorElement !== document.activeElement) editorElement.focus()
    }

    /**
     * Is-Thing-link method.
     * 
     * Determines if the currently-selected text is a link to a Thing in the current Graph.
     */
    function isThingLink(): boolean {
        return (
            editor !== null
            && editor.isActive('link')
            && editor.getAttributes("link").href.startsWith("graph://")
        )
    }

















    let graph: Graph | null = null




    /**
     * Build-and-refresh method.
     * Replaces any existing Graph with a new one, builds the new Graph, then
     * refreshes the viewers.
     */
    async function buildAndRefresh() {
        // Close any existing Graph.
        if (graph) {
            removeGraph(graph)
            graph = null
        }
        
        // Open and build the new Graph.
        graph = await addGraph(pThingIds as number[], depth, null, true, offAxis, false, space)
        graphWidgetStyle = {...startingGraphWidgetStyle}

        // Configure style for off-axis styling, if applicable.
        graph.offAxis = offAxis

        
        await markThingsVisited(pThingIds as number[])

        // Refresh the Graph viewers.
        addGraphIdsNeedingViewerRefresh(graph.id)
    }

    $: {
        pThingIds
        depth
        
        buildAndRefresh()
    }








    // Handles for HTML elements.
    let editButton: Element | null = null

    // Whether Notes are displayed as plain HTML or as an editable interface.
    let editing = $notesEditorLockedStore

    // Whether the viewer is locked in editing mode.
    let editingLocked = $notesEditorLockedStore

    // Show the edit-lock icon in the edit button if...
    $: showEditingLockedIcon = (
        (
            // The viewer is in editing mode, but not locked in that mode, and...
            editing
            && !editingLocked

            // The app is not on mobile, the mouse is hovering over the button, and the lock wasn't
            // just toggled...
            && (!onMobile() && editButtonHovered && !editingLockJustToggled)
        )

        // ...or...
        || (
            // The viewer is in editing mode, is locked in that mode, and the editing lock was just
            // toggled...
            editing
            && editingLocked
            && editingLockJustToggled
        )

        // ...or...
        || (
            // The viewer is locked in editing mode and the mouse is not hovering over the button.
            editingLocked
            && !editButtonHovered
        )
    ) ? true :
    false

    // Flags for interactions with the editing button.
    let editButtonHovered = false
    let editingLockJustToggled = false

    /**
     * Handle-edit-button method.
     * 
     * Called when the edit button is toggled, either turning on editing mode or turning it off
     * and handling related actions (like saving the Graph configuration).
     */
    function handleEditButton() {
        if (editing === false) {
            editing = true
        } else {
            editingLocked = !editingLocked
            editingLockJustToggled = true
            notesEditorLockedStore.set(editingLocked)
            saveGraphConfig()
        }
    }

    /**
     * Handle-possible-outside-click method.
     * 
     * Checks whether a mouse click happened outside of the editor, and if so,
     * disables editing.
     * @param event - The mouse click that activated the method.
     */
	function handlePossibleOutsideClick(event: MouseEvent) {
        // If...
		if (
            // ...the click wasn't on the Notes container or any part of it...
            event.target !== graphOutlineWidget
            && !graphOutlineWidget.contains(event.target as Node)
            
            // ...and the viewer isn't locked in editing mode,
            && !editingLocked

        // Disable editing.
        ) {
            editing = false
        }
	}

    function copyOutlineTextToClipboard() {
        try {
            const outlineText = graph?.rootCohort?.members[0].thing?.outlineText() ?? ""
            const outlineTextBlob = new Blob([outlineText], {type: "text/html"})
            const outlineTextClipboardItem = new ClipboardItem({"text/html": outlineTextBlob})
            navigator.clipboard.write([outlineTextClipboardItem])
        } catch {
            console.log(`Couldn't copy outline rich text to clipboard. Falling back to plain text (this may contain errors due to translation from HTML). If you are using Firefox this may be due to lack of support for the clipboard copy function. You can enable experimental support by navigating to "about:config", searching for "dom.events.asyncClipboard.clipboardItem", and setting its value to "true".`)
            const outlineText = graph?.rootCohort?.members[0].thing?.outlineText(true) ?? ""
            writePlainTextToClipboard(outlineText)
        }
    }

        




    let outlineScrollArea: HTMLElement | null = null
    let outlineScrollAreaTop = 0
    let outlineScrollTime: Date | null = null
    function onOutlineScroll() {
        outlineScrollAreaTop = (outlineScrollArea as HTMLElement).getBoundingClientRect().top
        outlineScrollTime = new Date()
    }
    







    function onThingMouseEnter() {
        if (graph) hoveredThingIdStore.set(graph?.pThingIds[0])
    }

    function onThingMouseLeave() {
        hoveredThingIdStore.set(null)
    }

    function onThingClick() {
        if (graph) {
            rePerspectToThingId(graph?.pThingIds[0])
            pThingIds = graph?.pThingIds
        }
    }








    onMount(async () => {
        await sleep(1)
        onOutlineScroll()
    })

    onDestroy(() => {
        if (graph) removeGraph(graph)
    })
</script>



<!-- Page body click and escape handlers. -->
<svelte:body
    on:click={handlePossibleOutsideClick}
/>



<!-- Graph outline widget. -->
<div
    class="graph-outline-widget"
    class:off-axis={offAxis}

    bind:this={graphOutlineWidget}

    style={offAxis ? "" : `background-color: ${$uITrimColorStore};`}
>
    {#if !offAxis}
        <!-- Title. -->
        <div
            class="title"

            style="
                {pThingIds[0] === $hoveredThingIdStore ? "box-shadow: 1px 1px 2px 1px dimgrey;" : ""}
                margin-left: {onMobile() && !$landscapeOrientation ? 60 : 1}px;
                margin-right: {onMobile() ? 45 : 0}px;
                {
                    onMobile() ? (
                        !$landscapeOrientation ? "position: relative; top: 5px; font-size: 0.9rem;" :
                        "position: relative; top: 5px; left: 4px; font-size: 0.9rem;"
                    ) :

                    ""
                }
                background-color: {
                    pThingIds[0] === $hoveredThingIdStore ? lightenOrDarkenColorString($thingColorStore, "darker", 4) :
                    $thingColorStore
                };
                font-family: {$titleFontStore ?? "Arial"};
                font-weight: {$titleFontWeightStore ?? 600};
            "

            on:mouseenter={onThingMouseEnter}
            on:mouseleave={onThingMouseLeave}
            on:click={onThingClick}
            on:keydown={()=>{}}
        >
            <div>{title}</div>
        </div>
    {/if}

    <!-- Root Thing Cohort widget (from which the rest of the Graph Outline automatically "grows"). -->
    <div
        class="root-thing-cohort-container"
        
        on:scroll={onOutlineScroll}
        bind:this={outlineScrollArea}
    >
        {#if graph?.rootCohort}
            <ThingCohortOutlineWidget
                thingCohort={graph.rootCohort}
                {graph}
                {graphWidgetStyle}
                {outlineScrollAreaTop}
                {outlineScrollTime}
                bind:editingNotes={editing}
                bind:notesEditor={editor}
                {rePerspectToThingId}
            />
        {/if}
    </div>

    {#if editor}
        <NotesToolbar
            {editor}
            {fullSize}
            focusEditorMethod={focusEditor}
            isThingLinkMethod={isThingLink}
        />
    {:else if !offAxis}
        <!-- Depth control. -->
        <div class="depth-control-container">
            <DepthControl
                bind:depth
            />

            <div
                class="depth-control-container-backfield"

                style="background-color: {$uITrimColorStore};"
            />
        </div>

        <button
            class="copy-outline-text-button"

            on:click={copyOutlineTextToClipboard}
            on:keydown={()=>{}}
        >
            <img
                src="./icons/copy.png"
                alt="Copy icon"
                width=30px
                height=30px
            >

            <!-- Tooltip. -->
            <Tooltip
                text={"Copy outline text."}
                direction={"up"}
            />
        </button>
    {/if}

    <!-- Edit button. -->
    {#if !$preventEditing && !offAxis}
        <div
            class="edit-button"
            class:editing
            class:editingLocked
            class:on-mobile={onMobile()}
            bind:this={editButton}

            on:mouseenter={() => {editButtonHovered = true}}
            on:mouseleave={() => {
                editButtonHovered = false
                editingLockJustToggled = false
            }}
            on:click={handleEditButton}
            on:keydown={()=>{}}
        >
            <!-- Editing status icon. -->
            <img
                src={
                    showEditingLockedIcon ? "./icons/lock-edit.png" : "./icons/edit.png" }
                alt={
                    showEditingLockedIcon ? "Lock Notes in editing mode" : "Edit Notes" }
                width=28px
                height=28px
            >

            <!-- Tooltip. -->
            <Tooltip
                text={
                    editing === false ? "Edit Notes." :
                    editingLocked === false ? "Lock in edit mode." :
                    "Un-lock edit mode."
                }
                direction={"up"}
                lean={"left"}
            />
        </div>
    {/if}
</div>


<style>
    .graph-outline-widget {
        box-sizing: border-box;
        width: 100%;
        height: 100%;

        display: flex;
        flex-direction: column;
        padding: 0.5rem;
        gap: 1px;
        
        user-select: none;
    }

    .graph-outline-widget.off-axis {
        padding: 0rem;
    }

    .title {
        flex: 0 0 34px;

        box-shadow: 1px 1px 1px 0px silver;
        outline: solid 0.25px lightgrey;
        outline-offset: -0.25px;
        border-radius: 4px;

        position: relative;
        width: fit-content;
        height: 34px;
        z-index: 1;

        display: flex;
        padding: 0.25rem 0.5rem 0.25rem 0.5rem;
        align-items: center;
    }










    .title div {
        margin: 0;

        text-align: left;
        font-size: 1.5rem;
        line-height: 1.5rem;
    }

    .root-thing-cohort-container {
        height: 100%;

        overflow-x: hidden;
        overflow-y: auto; 
        scrollbar-width: thin;
    }

    .depth-control-container {
        margin: 5px;

        position: absolute;
        left: 0;
        bottom: 0;
        z-index: 2;

        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 5px;
    }

    .depth-control-container-backfield {
        border-radius: 5px;

        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
        background-color: lightgrey;
    }

    .copy-outline-text-button {
        border-radius: 5px;
        border: none;

        position: absolute;
        bottom: 24px;
        right: 60px;
        background: none;

        display: flex;
		justify-content: center;
		align-items: center;

		cursor: default;
    }

    .copy-outline-text-button img {
        opacity: 0.25;
    }

    .copy-outline-text-button:hover {
        background: none;
    }

    .copy-outline-text-button:hover img {
        opacity: 0.75;
    }

    .copy-outline-text-button:active img {
        opacity: 1;
    }

    .edit-button {
		border-radius: 5px;

		box-sizing: border-box;
        position: absolute;
        bottom: 21px;
        right: 20px;
        opacity: 0.25;

		display: flex;
		justify-content: center;
		align-items: center;
        padding: 5px;

		cursor: default;
    }

    .edit-button.editing {
        outline: solid 1px lightgrey;
		outline-offset: -1px;

        right: 20px;
        bottom: 21px;

        background-color: white;
        opacity: 0.5;
    }

    .edit-button:hover {
        outline: solid 1px grey;

        background-color: gainsboro;
        opacity: 1;
    }

    .edit-button:active {
        background-color: lightgrey;
    }
</style>