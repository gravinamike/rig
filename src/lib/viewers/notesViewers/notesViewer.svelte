<script lang="ts">
    // Import types.
    import type { Graph } from "$lib/models/constructModels"

    // Import constants and stores.
    import { hyperlinkProtocols } from "$lib/shared/constants"

    // Import related widgets.
    import NotesEditor from "./notesEditor.svelte"

    // Import API methods.
    import { thingsByGuid, addNoteToThing, updateNote, markNotesModified } from "$lib/db/clientSide"


    import { notesBackgroundImageStore, notesEditorLockedStore, readOnlyMode, uITrimColorStore } from "$lib/stores"
    import { saveGraphConfig } from "$lib/shared/config"


    /**
     * @param graph - The Graph that this widget is displaying Notes for.
     * @param rePerspectToThingId - Method to re-Perspect the Graph to a given Thing ID.
     */
    export let graph: Graph
    export let rePerspectToThingId: (thingId: number) => Promise<void>

    
    // Handles for HTML elements.
    let editButton: Element
    let notesContainer: Element
    let textField: Element
    let textEditorField: Element

    // Whether Notes are displayed as plain HTML or as an editable interface.
    let editing = $notesEditorLockedStore

    // Whether the viewer is locked in editing mode.
    let editingLocked = $notesEditorLockedStore

    // Flags for interactions with the editing button.
    let editButtonHovered = false
    let editingLockJustToggled = false

    // Raw Note text.
    let currentPThingNoteText: string | null = null

    // Note text formatted for display.
    let viewerDisplayText: string | null = null

    // The current text content of the editor.
    let currentEditorTextContent: string | null = null

    // Whether the Note text has been edited in the editor.
    let editorTextEditedButNotSynced = false
    
    $: if (!graph.pThing?.note?.text) {
        currentPThingNoteText = null
        viewerDisplayText = null
    }

    // When Perspective Thing changes, update the raw and display text to match.
    $: if (typeof graph.pThing?.note?.text === "string") {
        updateTexts(graph.pThing.note.text)

        textField?.scroll({top: 0})
        textEditorField?.scroll({top: 0})
    }

    async function updateTexts(text: string) {
        currentPThingNoteText = text
        viewerDisplayText = textForDisplay(text)
    }

    /**
     * Text-for-display method.
     * 
     * Reformats Perspective Thing text to make it suitable for display mode
     * (so empty paragraphs and line breaks render correctly).
     * @param text - The Perspective Thing text to be processed.
     */
     function textForDisplay(text: string) {
        return text
            .replace(/<br><\/p><\/li>/gi, "<br><br></p></li>")
            .replace(/<p><\/p>/gi, "<p>&nbsp;</p>")
    }


    $: if (currentEditorTextContent !== null && editorTextEditedButNotSynced) {
        updateTextsAndDbToMatchEditorContent(currentEditorTextContent)
    }

    async function updateTextsAndDbToMatchEditorContent(currentEditorTextContent: string) {
        await updateTexts(currentEditorTextContent)
        await createAndUpdateNote(currentEditorTextContent)
        editorTextEditedButNotSynced = false
    }

    async function createAndUpdateNote(currentEditorTextContent: string): Promise<void> {
        const pThingNoteId = graph.pThing?.note?.id || null
        let noteIdToUpdate: number | null | false = pThingNoteId
        if (pThingNoteId === null) noteIdToUpdate = await createNoteIfNecessary()
        if (noteIdToUpdate) updateAndRefreshNote(noteIdToUpdate, currentEditorTextContent)
    }

    /**
     * Create-Note-if-necessary method.
     * 
     * Create Note if none exists for this Thing.
     */
    async function createNoteIfNecessary(): Promise<number | false> {
        if (!graph.pThing?.id) return false

        // Create a new Note.
        const createdNoteId = await addNoteToThing(graph.pThing.id)
        if (!createdNoteId) return false
        
        return createdNoteId
    }

    /**
     * Update-Note method.
     * 
     * Update the Note in the database based on the edits that have been made in
     * the editor, then refresh the front-end to show the new Note.
     */
    async function updateAndRefreshNote(noteId: number, newText: string) {
        // Update the Note and mark the Thing as modified.
        await updateNote(noteId, newText)
        await markNotesModified(noteId)

        await graph.refreshPThing()
    }

    // Set up custom hyperlink handling for Thing-links.
    document.addEventListener("click", handleHyperlinkClick)
    
    
    // Note title (Thing text).
    $: title = graph.pThing ? graph.pThing.text : "THING NOT FOUND IN STORE"

    // Whether to show the edit-lock icon in the edit button.
    $: showEditingLockedIcon = (
        (
            editing
            && !editingLocked
            && (editButtonHovered && !editingLockJustToggled)
        )
        || (
            editing
            && editingLocked
            && editingLockJustToggled
        )
        || (
            editingLocked
            && !editButtonHovered
        )
    ) ? true : false



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
            && event.target !== editButton 
            && !editButton.contains(event.target as Node)
            && !editingLocked
        ) editing = false
	}

    /**
     * Handle-escape method.
     * 
     * Checks whether the escape key was pressed, and if so, disables editing.
     * @param event - The key event that activated the method.
     */
    function handleEscape(event: KeyboardEvent) {
        if (event.key === "Escape" && !editingLocked) editing = false
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
        // When in editor mode, if the Control key modifier wasn't pressed when
        // clicking, abort.
        if (editing && !event.ctrlKey) return

        // Determine if the hyperlink is regular (or follows a special Thing-link
        // protocol).
        let isRegularHyperlink = false
        for (const protocol of hyperlinkProtocols) {
            if (hyperlink.href.startsWith(`${protocol}://`)) isRegularHyperlink = true
        }

        // If the hyperlink follows a normal protocol,
        if (isRegularHyperlink) {
            // For editing mode, reimplement normal opening of hyperlinks.
            if (editing) window.open(hyperlink.href, hyperlink.target)
        
        // Else, if the hyperlink follows a special Thing-link protocol,
        } else {
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


    $: notesBackgroundImageUrl =
        $notesBackgroundImageStore ? `customizable/background-images/${$notesBackgroundImageStore}` :
        null





</script>


<!-- Page body click and escape handlers. -->
<svelte:body
    on:click={handlePossibleOutsideClick}
    on:keyup={handleEscape}
/>


<!-- Notes viewer. -->
<div
    class="notes-viewer graph-{graph.id}"

    style="background-color: {$uITrimColorStore};"
>

    <!-- Title. -->
    <div class="title">
        <h3>{title}</h3>
    </div>

    <!-- Container to hold either Note display or Note editor. -->
    <div
        class="notes-container"
        bind:this={notesContainer}
        
        on:dblclick={ () => {editing = true} }
    >
        <!-- Note editor. -->
        {#if !$readOnlyMode && editing}
            <NotesEditor
                {currentPThingNoteText}
                bind:currentEditorTextContent
                bind:editorTextEditedButNotSynced
                bind:textField={textEditorField}
            />

        <!-- Note display. -->
        {:else}
            <div
                class="notes-display"

                bind:this={textField}
                
                style={
                    notesBackgroundImageUrl ? `
                        background-image: url(${notesBackgroundImageUrl});
                        background-size: 100% 100vh;
                    ` :
                    ""
                }
            >
                {@html viewerDisplayText}
            </div>
        {/if}
    </div>

    <!-- Edit button. -->
    {#if !$readOnlyMode}
        <div
            class="edit-button"
            class:editing
            class:editingLocked
            bind:this={editButton}

            on:mouseenter={() => {editButtonHovered = true}}
            on:mouseleave={() => {
                editButtonHovered = false
                editingLockJustToggled = false
            }}
            on:click={handleEditButton}
            on:keydown={()=>{}}
        >
            <img
                src={
                    showEditingLockedIcon ? "./icons/lock-edit.png" : "./icons/edit.png" }
                alt={
                    showEditingLockedIcon ? "Lock Notes in editing mode" : "Edit Notes" }
                width=20px
                height=20px
            >
        </div>
    {/if}
    
</div>


<style>
    .notes-viewer {
        box-sizing: border-box;
        position: relative;
        width: 100%;
        height: 100%;

        display: flex;
        flex-direction: column;
        padding: 0.5rem;
        gap: 0.5rem;

        text-align: center;
    }

    .edit-button {
		border-radius: 5px;

		box-sizing: border-box;
        position: absolute;
        bottom: 0.75rem;
        right: 1rem;
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

        bottom: 75px;

        background-color: white;
        opacity: 1;
    }

    .edit-button:hover {
        outline: solid 1px grey;

        background-color: gainsboro;
        opacity: 1;
    }

    .edit-button:active {
        background-color: lightgrey;
    }

    .title {
        height: 23px;

        display: flex;
        align-items: center;
        justify-content: center;
    }

    h3 {
        margin: 0;
    }

    .notes-container {
        flex: 1 1;

        display: flex;
        flex-direction: column;
    }

    .notes-display {
        flex: 1 1 0;

        border-radius: 5px;

        box-sizing: border-box;
        background-color: white;

        padding: 1rem 2rem 1rem 2rem;

        overflow-x: hidden;
        overflow-y: auto;
        scrollbar-width: thin;

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