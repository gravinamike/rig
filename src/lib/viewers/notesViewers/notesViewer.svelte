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
    import { addNoteToThing, markNotesModified, thingsByGuid, updateNote } from "$lib/db/clientSide"


    /**
     * @param graph - The Graph that this widget is displaying Notes for.
     * @param rePerspectToThingId - Method to re-Perspect the Graph to a given Thing ID.
     */
    export let graph: Graph
    export let rePerspectToThingId: (thingId: number) => Promise<void>

    
    
    let notesContainer: Element

    // Editable flag indicates whether Notes are displayed as plain HTML or as an editable interface.
    let editable = false

    // The current text content of the editor.
    let editorContent = ""

    // Updating-text-after-re-Perspect flag indicates whether the text is
    // currently in the process of being updated after the Graph was
    // re-Perspected.
    let updatingTextAfterRePerspect = false

    // Note-changed flag indicates whether the Note text has changed in the editor.
    let noteChanged = false
    // It is set to true whenever an edit is made, and is reset to false whenever the Note
    // text changes with the Perspective.
    // When it changes to True, save the changes to the stores and back-end.
    $: if (noteChanged && !updatingTextAfterRePerspect) handleNoteEdited()

    // Set up custom hyperlink handling for Thing-links.
    document.addEventListener("click", handleHyperlinkClick)



    // Determine Perspective Thing.
    let pThing: Thing | null = null
    $: {
        graph.pThingIds
        
        pThing = graph.pThing
    }

    // Get Note title (Thing text).
    $: title = pThing ? pThing.text : "THING NOT FOUND IN STORE"

    // Get Note text.
    let noteText = ""
    let noteTextForDisplay = "" // Post-processing is needed to make empty paragraphs and line breaks render correctly in the display.
    
    function setTextFromPThing(pThing: Thing) {
        updatingTextAfterRePerspect = true
        noteText = pThing?.note?.text || ""
        noteTextForDisplay = textForDisplay(noteText)
        updatingTextAfterRePerspect = false
    }
    $: if (pThing) setTextFromPThing(pThing)    


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
        ) {
			editable = false
		}
	}

    /**
     * Handle-escape method.
     * 
     * Checks whether the escape key was pressed, and if so, disables editing.
     * @param event - The key event that activated the method.
     */
    function handleEscape(event: KeyboardEvent) {
        if (event.key === "Escape") editable = false
    }


    /**
     * Handle-note-changed method.
     * 
     * Checks whether the escape key was pressed, and if so, disables editing.
     */
    async function handleNoteEdited() {
        // If there's no Perspective Thing, abort.
        if (!pThing || !pThing.id) return

        let noteId = pThing?.note?.id || null

        // If there's not yet a Note for this Perspective Thing, create one.
        if (noteId === null) {
            // Create a new Note.
            const newNoteId = await addNoteToThing(pThing.id)
            if (!newNoteId) return
            noteId = newNoteId
            // Re-store the Thing and re-build the Graph (in order to update
            // the Note ID).
            await storeGraphDbModels<ThingDbModel>("Thing", pThing.id, true)
            await graph.build()
            pThing = graph.pThing as Thing
        }
        // Update the Note and mark the Thing as modified.
        await updateNote(noteId, editorContent)
        await markNotesModified(noteId)
        // Re-store the Thing (in order to update its linker to the created/updated Note).
        await storeGraphDbModels<ThingDbModel>("Thing", pThing.id as number, true)
        noteChanged = false
        noteTextForDisplay = textForDisplay(editorContent)
    }


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
        
        on:dblclick={() => {editable = true}}
    >
        <!-- Note editor. -->
        {#if editable}
            <NotesEditor
                bind:noteText
                bind:noteChanged
                bind:editorContent
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
    }

    :global(.notes-display li > p) {
        margin-top: 0;
        margin-bottom: 0;

        word-wrap: break-word;
        white-space: break-spaces;
    }
</style>