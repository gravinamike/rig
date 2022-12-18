<script lang="ts">
    // Import types.
    import type { Thing, Graph } from "$lib/models/constructModels"
    import type { ThingDbModel } from "$lib/models/dbModels/clientSide"

    // Import constants and stores.
    import { hyperlinkProtocols } from "$lib/shared/constants"
    import { storeGraphDbModels } from "$lib/stores/graphConstructStores"

    // Import related widgets.
    import NotesEditor from "./notesEditor.svelte"

    // Import API methods.
    import { thingsByGuid, addNoteToThing, updateNote, markNotesModified } from "$lib/db/clientSide"


    /**
     * @param graph - The Graph that this widget is displaying Notes for.
     * @param rePerspectToThingId - Method to re-Perspect the Graph to a given Thing ID.
     */
    export let graph: Graph
    export let rePerspectToThingId: (thingId: number) => Promise<void>

    
    // Handles for HTML elements.
    let notesContainer: Element

    // Set up custom hyperlink handling for Thing-links.
    document.addEventListener("click", handleHyperlinkClick)


    // "Editing" flag indicates whether Notes are displayed as plain HTML or as
    // an editable interface.
    let editing = false

    // "Updating-text-to-match-Perspective-Thing" flag indicates whether the text
    // is currently in the process of being updated to match that of the
    // Perspective Thing. (This happens after the Graph is re-Perspected.)
    let updatingTextToMatchPThing = false

    // "Notes-editor-text-changed" flag indicates whether the Note text has
    // changed in the editor.
    let editorTextContentChanged = false
    

    // Note ID.
    $: pThingNoteId = graph.pThing?.note?.id || null

    // Note title (Thing text).
    $: title = graph.pThing ? graph.pThing.text : "THING NOT FOUND IN STORE"

    // Raw Note text.
    let pThingNoteText = ""

    // Display Note text. (Post-processing is needed to make empty paragraphs and
    // line breaks render correctly in the display.)
    let noteTextForDisplay = ""

    // The current text content of the editor.
    let editorTextContent = ""
    $: console.log(editorTextContent)








    // When Perspective Thing changes, update the raw and display text to match.
    function updateTextToMatchPThing(pThing: Thing) {
        updatingTextToMatchPThing = true

        pThingNoteText = pThing?.note?.text || ""
        noteTextForDisplay = textForDisplay(pThingNoteText)

        updatingTextToMatchPThing = false
    }
    $: if (graph.pThing) updateTextToMatchPThing(graph.pThing)    

    // When the Notes editor text is changed (other than from when the
    // Perspective Thing changes), call the handle-Note-edited method,
    $: if (editorTextContentChanged && !updatingTextToMatchPThing) handleNoteEdited()




    

    


    /**
     * Handle-possible-outside-click method.
     * 
     * Checks whether a mouse click happened outside of the editor, and if so,
     * disables editing.
     * @param event - The mouse click that activated the method.
     */
	function handlePossibleOutsideClick(event: MouseEvent) {
		if (
            event.target !== notesContainer
            && !notesContainer.contains(event.target as Node)
        ) editing = false
	}

    /**
     * Handle-escape method.
     * 
     * Checks whether the escape key was pressed, and if so, disables editing.
     * @param event - The key event that activated the method.
     */
    function handleEscape(event: KeyboardEvent) {
        if (event.key === "Escape") editing = false
    }


    /**
     * Handle-note-changed method.
     * 
     * Ch
     */
    async function handleNoteEdited() {
        // If there's no Perspective Thing, abort.
        if (!graph.pThing || !graph.pThing.id) return

        // If there's not yet a Note for this Perspective Thing, create one.
        let createdNoteId: number | false = false
        if (pThingNoteId === null) {
            // Create a new Note.
            createdNoteId = await addNoteToThing(graph.pThing.id)
            if (!createdNoteId) return

            // Re-store the Thing and re-build the Graph (in order to update
            // the Note ID).
            await graph.refreshPThing()
        }

        // Update the Note and mark the Thing as modified.
        let noteIdToUpdate = pThingNoteId ? pThingNoteId : createdNoteId as number
        await updateNote(noteIdToUpdate, editorTextContent)
        await markNotesModified(noteIdToUpdate)
        
        // Re-store the Thing (in order to update its linker to the created/updated Note).
        await storeGraphDbModels<ThingDbModel>("Thing", graph.pThing.id as number, true)
        editorTextContentChanged = false
        noteTextForDisplay = textForDisplay(editorTextContent)
    }


    /**
     * Text-for-display method.
     * 
     * Reformats Perspective Thing text to make it suitable for display mode
     * (by replacing certain whitespace characters).
     * @param text - The Perspective Thing text to be processed.
     */
    function textForDisplay(text: string) {
        return text
            .replace(/<br><\/p><\/li>/gi, "<br><br></p></li>")
            .replace(/<p><\/p>/gi, "<p>&nbsp;</p>")
    }
    
    /**
     * Handle-hyperlink-clicked method.
     * 
     * Implements custom hyperlink behavior to allow for Thing-links (hyperlinks
     * that lead to Things in the Graph instead of external URLs).
     * @param event - The mouse click that activated the method.
     */
    async function handleHyperlinkClick(event: MouseEvent) {
        // Get the hyperlink <a> element.
        const hyperlink = event.target ? (event.target as Element).closest("a") : null
        if (!hyperlink) return

        // Determine if the hyperlink is regular (or follows a special Thing-link
        // protocol).
        let isRegularHyperlink = false
        for (const protocol of hyperlinkProtocols) {
            if (hyperlink.href.startsWith(`${protocol}://`)) isRegularHyperlink = true
        }

        // If the hyperlink follows a special Thing-link protocol,
        if (!isRegularHyperlink) {
            // Prevent the default handler.
            event.preventDefault()

            // Get the Graph ID.
            const notesViewer = hyperlink.closest(".notes-viewer")
            if (!notesViewer) return
            const classes = (notesViewer as HTMLDivElement).classList
            const graphId = Number(classes[1][classes[1].length - 1])

            // Get the linked Thing's GUID.
            const guid = hyperlink.href.split("//")[1]

            // Get the Thing ID that corresponds to that GUID.
            const thingsForGuid = await thingsByGuid([guid])
            const thingId = thingsForGuid.length ? thingsForGuid[0].id : null

            // Re-Perspect to that Thing ID.
            if (graph.id === graphId && thingId) {
                rePerspectToThingId(thingId)
            }
        }
    }
</script>


<!-- Page body click and escape handlers. -->
<svelte:body
    on:click={handlePossibleOutsideClick}
    on:keyup={handleEscape}
/>


<!-- Notes viewer. -->
<div class="notes-viewer graph-{graph.id}">

    <!-- Title. -->
    <h4>{title}</h4>

    <!-- Container to hold either Note display or Note editor. -->
    <div
        class="notes-container"
        bind:this={notesContainer}
        
        on:dblclick={ () => {editing = true} }
    >
        <!-- Note editor. -->
        {#if editing}
            <NotesEditor
                bind:pThingNoteText
                bind:editorTextContentChanged
                bind:editorTextContent
            />

        <!-- Note display. -->
        {:else}
            <div class="notes-display">
                {@html noteTextForDisplay}
            </div>
        {/if}
    </div>
    
</div>


<style>
    .notes-viewer {
        outline: solid 1px lightgrey;
        outline-offset: -1px;

        box-sizing: border-box;
        width: 500px;
        height: 100%;
        background-color: #fafafa;

        display: flex;
        flex-direction: column;
        padding: 0.75rem;
        gap: 0.75rem;

        text-align: center;
    }

    h4 {
        flex: 0 0;

        margin: 0;
    }

    .notes-container {
        flex: 1 1;

        display: flex;
        flex-direction: column;
    }

    .notes-display {
        flex: 1 1 0;

        outline: solid 1px lightgrey;
        outline-offset: -1px;

        box-sizing: border-box;
        background-color: white;

        padding: 0.5rem;

        overflow-x: hidden;
        overflow-y: auto;

        text-align: left;
        white-space: pre-wrap;
    }

    :global(.notes-display li > p) {
        margin-top: 0;
        margin-bottom: 0;

        word-wrap: break-word;
        white-space: break-spaces;
    }
</style>