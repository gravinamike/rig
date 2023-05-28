<script lang="ts">
    // Import types.
    import type { Graph, Thing } from "$lib/models/constructModels"

    // Import constants and stores.
    import { hyperlinkProtocols } from "$lib/shared/constants"

    // Import related widgets.
    import NotesEditor from "./notesEditor.svelte"

    // Import API methods.
    import { thingsByGuid, addNoteToThingOrGetExistingNoteId, updateNote, markNotesModified } from "$lib/db"


    import { notesBackgroundImageStore, notesEditorLockedStore, readOnlyMode, storeGraphDbModels, uITrimColorStore } from "$lib/stores"
    import { saveGraphConfig } from "$lib/shared/config"
    import type { ThingDbModel } from "$lib/models/dbModels"
    import { onMobile, removeItemFromArray, sleep } from "$lib/shared/utility";


    /**
     * @param graph - The Graph that this widget is displaying Notes for.
     * @param viewerOrientation - Whether the Graph viewer is arranged horizontally or vertically.
     * @param rePerspectToThingId - Method to re-Perspect the Graph to a given Thing ID.
     */
    export let graph: Graph
    export let viewerOrientation: "horizontal" | "vertical"
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
    

    // The Graph's Perspective Thing info is proxied here, to prevent
    // reactive updates whenever the Graph is refreshed.
    let pThing = graph.pThing
    let pThingNoteId = graph.pThing?.note?.id || null
    function updatePThing(newPThing: Thing | null) {
        if (newPThing !== pThing) {
            pThing = newPThing
            pThingNoteId = newPThing?.note?.id || null
        }
    }
    $: updatePThing(graph.pThing)


    $: if (pThing?.note?.text) {
        currentPThingNoteText = null
        viewerDisplayText = null
    }

    // When Perspective Thing changes, update the raw and display text to match
    // (or, if the Perspective Thing doesn't yet have a Note, set blank text).
    $: if (typeof pThing?.note?.text === "string") {
        updateTexts(pThing.note.text, true)
    } else {
        updateTexts("", true)
    }

    async function updateTexts(text: string, scrollToTop=false) {
        currentPThingNoteText = text
        viewerDisplayText = textForDisplay(text)

        if (scrollToTop) {
            textField?.scroll({top: 0})
            textEditorField?.scroll({top: 0})
        }
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



    let noteCreationAttemptTimestamps: string[] = []
    async function createAndUpdateNote(currentEditorTextContent: string): Promise<void> {
        // If there are any Note-creation attempts in progress, delay the
        // update a bit before trying again.
        if (noteCreationAttemptTimestamps.length > 0) {
            await sleep(100)
            createAndUpdateNote(currentEditorTextContent)

        // Otherwise, (create if necessary, then) update the Note.
        } else {
            let noteIdToUpdate: number | null = pThingNoteId

            // Create the node if necessary.
            if (noteIdToUpdate === null) {
                const noteCreationAttemptTimestamp = (new Date()).toISOString()
                noteCreationAttemptTimestamps.push(noteCreationAttemptTimestamp)

                noteIdToUpdate = await createNoteIfNecessary() || null

                removeItemFromArray(noteCreationAttemptTimestamps, noteCreationAttemptTimestamp)
            }

            // Update the note.
            if (noteIdToUpdate) await updateAndRefreshNote(noteIdToUpdate, currentEditorTextContent)
        }
        
    }

    /**
     * Create-Note-if-necessary method.
     * 
     * Create Note if none exists for this Thing.
     */
    async function createNoteIfNecessary(): Promise<number | false> {
        if (!graph.pThing?.id) return false

        // Create a new Note.
        const createdNoteId = await addNoteToThingOrGetExistingNoteId(graph.pThing.id)
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
        // Update the Note and mark the Thing as modified in the database.
        await updateNote(noteId, newText)
        await markNotesModified(noteId)
        pThingNoteId = noteId

        // Update the note in the stores and the Graph.
        if (graph.pThing?.id) await storeGraphDbModels<ThingDbModel>("Thing", graph.pThing.id, true)
        viewerDisplayText = textForDisplay(newText)
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
        const thingLinkingWidgets = document.getElementsByClassName("thing-linking-widget")
        const thingLinkingWidget = thingLinkingWidgets.length ? thingLinkingWidgets[0] : null

		if (
            event.target !== notesContainer
            && !notesContainer.contains(event.target as Node)
            && event.target !== editButton 
            && !editButton.contains(event.target as Node)
            && !(
                thingLinkingWidget
                && (
                    event.target === thingLinkingWidget
                    || thingLinkingWidget.contains(event.target as Node)
                )
            )
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
            if (editing) {
                // Use the href as a target for external Graph links, so that
                // clicking them opens any pre-existing tab instance instead
                // of opening a new tab.
                const target =
                    hyperlink.href.includes("/#graph=") ? hyperlink.href :
                    hyperlink.target
                window.open(hyperlink.href, target)
            }
        
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
    class:on-mobile={onMobile()}

    style="background-color: {$uITrimColorStore};"
>

    <!-- Title. -->
    <div
        class="title"

        style="
            margin-left: {onMobile() ? 60 : 8}px;
            margin-right: {onMobile() ? 45 : 0}px;
            {onMobile() ? "position: relative; top: 6px; font-size: 0.9rem;" : ""}
        "
    >
        <h2>{title}</h2>
    </div>

    <!-- Container to hold either Note display or Note editor. -->
    <div
        class="notes-container"
        bind:this={notesContainer}

        style={onMobile() ? "font-size: 0.5rem; padding: 0.5rem 1rem 0.5rem 1rem;" : ""}
        
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
                class:on-mobile={onMobile()}

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

    .notes-viewer.on-mobile {
        margin-left: -0.25rem;
        padding: 0.25rem 0 0 0;
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

        right: 0.9rem;
        bottom: 1rem;

        background-color: white;
        opacity: 1;
    }

    .edit-button.editing.on-mobile {
        right: 0.74rem;
        bottom: 0.87rem;
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
        height: 34px;

        display: flex;
        align-items: center;
    }

    h2 {
        margin: 0;
        text-align: left;
        line-height: 1.5rem;
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

    .notes-display.on-mobile {
        width: 102%;

        padding: 0.5rem 1rem 0.5rem 1rem;

        font-size: 0.85rem;
    }

    :global(.notes-display li > p) {
        margin-top: 0;
        margin-bottom: 0;

        word-wrap: break-word;
        white-space: break-spaces;
    }

    :global(.notes-display.on-mobile ul) {
        padding-left: 1.5rem;
    }
</style>