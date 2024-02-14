<script lang="ts">
    // Import types.
    import type { Editor } from "@tiptap/core"
    import type { ThingDbModel } from "$lib/models/dbModels"
    import type { Graph, Thing } from "$lib/models/constructModels"

    // Import SvelteKit framework resources.
    import { tick } from "svelte"

    // Import constants.
    import { hyperlinkProtocols } from "$lib/shared/constants"

    // Import stores.
    import {
        landscapeOrientation, readOnlyMode,
        notesBackgroundImageStore, uITrimColorStore, titleFontStore, titleFontWeightStore,
        notesEditorLockedStore, storeGraphDbModels, updateNoteSearchListStore
    } from "$lib/stores"

    // Import utility functions.
    import { onMobile, sleep, removeItemFromArray } from "$lib/shared/utility"

    // Import related widgets.
    import NotesEditor from "./notesEditor.svelte"
    import TopBottomJumpButtons from "./topBottomJumpButtons.svelte"
    import SavingIndicator from "./savingIndicator.svelte"
    import { Tooltip } from "$lib/widgets/layoutWidgets"

    // Import API methods.
    import { saveGraphConfig } from "$lib/shared/config"
    import {
        getThingsByGuid, addNoteToThingOrGetExistingNoteId,
        updateNote, markNotesModified, getNoteSearchListItems
    } from "$lib/db"



    /**
     * @param graph - The Graph that this widget is displaying Notes for.
     * @param thing - The Thing that this widget is displaying Notes for. (If null, defaults to the Perspective Thing of the Graph.)
     * @param outlineFormat - Whether to format the viewer for use in a Graph outline widget.
     * @param fullSize: Whether the viewer's menu is opened to full-size.
     * @param activeNotesEditorForOutliner - The active Tiptap editor (if any) for the Graph outline widget this belongs to (if any).
     * @param rePerspectToThingId - Method to re-Perspect the Graph to a given Thing ID.
     */
    export let graph: Graph
    export let thing: Thing | null = null
    export let outlineFormat = false
    export let makeRoomForThingText = false
    export let fullSize: boolean
    export let activeNotesEditorForOutliner: Editor | null
    export let rePerspectToThingId: (thingId: number) => Promise<void>

    

    // Handles for HTML elements.
    let editButton: Element | null = null
    let notesContainer: Element
    let textField: Element
    let textFieldScrollTop = 0
    let textFieldClientHeight = 0
    let textFieldScrollHeight = 0
    let textEditorField: Element


    /* UI-state-related variables. */
    
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

    // Set up custom hyperlink handling for Thing-links.
    document.addEventListener("click", handleHyperlinkClick)


    /* Editing-/saving-state-related variables. */

    // Whether the Note text has been edited in the editor.
    let editorTextEditedButNotSynced = false

    // If the Notes have been changed in the editor but haven't been synced yet, sync them with the
    // local proxies and the back-end database.
    $: if (currentEditorTextContent !== null && editorTextEditedButNotSynced) {
        updateTextsAndDbToMatchEditorContent(currentEditorTextContent)
    }

    // Timestamp histories of non-resolved Note creation and save operations.
    let noteDbCreationAttemptTimestamps: string[] = []
    let noteDbSaveOperationTimestamps: string[] = []

    // Whether the Notes are currently in the process of being saved to the database, and whether
    // there has been an error in that process.
    $: savingNotesToDb = noteDbSaveOperationTimestamps.length > 0 ? true : false
    let savingNotesError = false

    

    /* Thing-related variables. */

    // The Thing info is proxied here, to prevent reactive updates whenever the Graph or Thing is
    // refreshed.
    let thingToUse = thing === null ? graph.pThing : thing
    let thingNoteId = thingToUse?.note?.id ?? null

    // Update the Thing that the Notes are based on when the Graph or its Perspective
    // Thing change.
    $: updateThing(thing ?? graph.pThing)


    /* Text-related variables. */

    // Note title (Thing text).
    $: title = thing?.text ?? "THING NOT FOUND IN STORE"

    // Raw Note text.
    let currentThingNoteText: string | null = null

    // Note text formatted for display.
    let viewerDisplayText: string | null = null
    
    // The current text content of the editor.
    let currentEditorTextContent: string | null = null

    // If the Thing or its Note text changes, set variables that reference it to null.
    $: if (thing?.note?.text) {
        currentThingNoteText = null
        viewerDisplayText = null
    }

    // When the Thing changes, update the raw and display text to match (or, if the Thing doesn't
    // yet have a Note, set blank text).
    $: if (typeof thing?.note?.text === "string") {
        updateFrontEndTexts(thing.note.text, true)
    } else {
        updateFrontEndTexts("", true)
    }


    /* UI-related variables. */

    // Notes-background image URL (if any).
    $: notesBackgroundImageUrl =
        $notesBackgroundImageStore ? `customizable/background-images/${$notesBackgroundImageStore}` :
        null

    // When the editor is toggled, set the scroll height of the text field to match its content.
    $: {
        editing

        textFieldScrollHeight = textField?.scrollHeight || 0
    }



    /**
     * Update-Thing method.
     * 
     * Updates the local proxy of the Thing the Notes are associated with (as well as the
     * associated Note ID).
     * @param newThing - The new Thing.
     */
    function updateThing(newThing: Thing | null) {
        if (newThing !== thing) {
            thing = newThing
            thingNoteId = newThing?.note?.id || null
        }
    }

    /**
     * Update-texts-and-database-to-match-editor-content method.
     * 
     * When the content of the text editor has been changed, this method is used to sync the other
     * versions of the Note text on both the front and back ends with it.
     * @param currentEditorTextContent - The current content of the text editor, to which the other versions should be synced.
     */
    async function updateTextsAndDbToMatchEditorContent(currentEditorTextContent: string) {
        // Sync the other versions of the Note text on the front-end.
        await updateFrontEndTexts(currentEditorTextContent)

        // Sync the version of the Note text in the database.
        await createAndUpdateNoteInDatabase(currentEditorTextContent)

        // Note that the text has been synced.
        editorTextEditedButNotSynced = false
    }

    /**
     * Update-front-end-texts method.
     * 
     * Updates the different versions of the Note text (the proxy of the current Thing Note text
     * and the text in the Notes display) to the supplied string.
     * @param text - The string to update the texts to.
     * @param scrollToTop - Whether to scroll the Notes viewer to the top after updating.
     */
    async function updateFrontEndTexts(text: string, scrollToTop=false) {
        // Set the other versions of the Notes text to the supplied string.
        currentThingNoteText = text
        viewerDisplayText = textForDisplay(text)

        // Update the scroll height of the text field to reflect the new text.
        await tick()
        textFieldScrollHeight = textField?.scrollHeight || 0

        // Scroll to the top (if requested).
        if (scrollToTop) {
            textField?.scroll({top: 0})
            textEditorField?.scroll({top: 0})
        }
    }

    /**
     * Create-and-update-Note-in-database method.
     * 
     * Creates a Note for the Thing if necessary, then updates either the new Note or its existing
     * Note based on the supplied string.
     * @param currentEditorTextContent - The string to set the Note to.
     */
    async function createAndUpdateNoteInDatabase(currentEditorTextContent: string) {
        // If there are any Note-creation attempts in progress, delay the update a bit, then try
        // again.
        if (noteDbCreationAttemptTimestamps.length > 0) {
            await sleep(100)
            createAndUpdateNoteInDatabase(currentEditorTextContent)

        // Otherwise, (create if necessary, then) update the Note.
        } else {
            // Get the ID of the Note to update.
            let noteIdToUpdate: number | null = thingNoteId

            // If there is no such Note yet, create it.
            if (noteIdToUpdate === null) {
                // Register the creation attempt.
                const noteCreationAttemptTimestamp = (new Date()).toISOString()
                noteDbCreationAttemptTimestamps.push(noteCreationAttemptTimestamp)

                // Create the Note and get the new ID.
                noteIdToUpdate = await createNoteIfNecessary() || null

                // Remove the creation-attempt from the register to indicate that it is resolved.
                removeItemFromArray(noteDbCreationAttemptTimestamps, noteCreationAttemptTimestamp)
            }

            // Update the Note.
            if (noteIdToUpdate) await updateAndRefreshNote(noteIdToUpdate, currentEditorTextContent)
        }
    }

    /**
     * Create-Note-if-necessary method.
     * 
     * Create Note if none exists for this Thing.
     */
    async function createNoteIfNecessary(): Promise<number | false> {
        // If there is no Thing ID to create a Note for, abort.
        if (!thing?.id) return false

        // Create a new Note.
        const createdNoteId = await addNoteToThingOrGetExistingNoteId(thing.id)
        
        // Return the ID of the new Note, or false if no Note was created.
        if (!createdNoteId) return false
        return createdNoteId
    }

    /**
     * Update-Note method.
     * 
     * Update the Note in the database based on the edits that have been made in the editor, then
     * refresh the front end to show the new Note.
     */
    async function updateAndRefreshNote(noteId: number, newText: string) {
        // Register the save attempt.
        const noteSaveOperationTimestamp = (new Date()).toISOString()
        noteDbSaveOperationTimestamps = [...noteDbSaveOperationTimestamps, noteSaveOperationTimestamp]

        // Update the Note and mark the Thing as modified in the database.
        const updated = await updateNote(noteId, newText)

        // Register whether there was an error saving the Note.
        if (updated) {
            savingNotesError = false
        } else {
            savingNotesError = true
        }

        // Remove the save attempt from the register to indicate that it is resolved (but wait 1
        // second first, so that the saving icon persists long enough for the user to see it).
        (async () => {
            await sleep(1000)
            removeItemFromArray(noteDbSaveOperationTimestamps, noteSaveOperationTimestamp)
            noteDbSaveOperationTimestamps = noteDbSaveOperationTimestamps
        })()
        
        // If the note was not successfully updated, return.
        if (!updated) return

        // Mark that the Note has been modified in the database, and set the local proxy of the
        // Thing Note ID to the Note ID.
        await markNotesModified(noteId)
        thingNoteId = noteId

        // Update the Note in the stores and the Graph.
        if (thing?.id) await storeGraphDbModels<ThingDbModel>("Thing",thing.id, true)
        viewerDisplayText = textForDisplay(newText)
        if (thing?.note) thing.note.text = newText

        // Update the Note search list.
        const queriedNoteSearchListItems = await getNoteSearchListItems([noteId])
        if (queriedNoteSearchListItems) updateNoteSearchListStore(queriedNoteSearchListItems)
    }

    /**
     * Text-for-display method.
     * 
     * Reformats Thing text to make it suitable for display mode (so empty paragraphs and line
     * breaks render correctly).
     * @param text - The Thing text to be processed.
     */
    function textForDisplay(text: string) {
        return text
            .replace(/<br><\/p><\/li>/gi, "<br><br></p></li>")
            .replace(/<p><\/p>/gi, "<p>&nbsp;</p>")
    }


    /**
     * Handle-possible-outside-click method.
     * 
     * Checks whether a mouse click happened outside of the editor, and if so,
     * disables editing.
     * @param event - The mouse click that activated the method.
     */
	function handlePossibleOutsideClick(event: MouseEvent) {
        // Get the Thing-linking widget element.
        const thingLinkingWidgets = document.getElementsByClassName("thing-linking-widget")
        const thingLinkingWidget = thingLinkingWidgets.length ? thingLinkingWidgets[0] : null

        // If...
		if (
            // ...the click wasn't on the Notes container or any part of it...
            event.target !== notesContainer
            && !notesContainer.contains(event.target as Node)

            // ...or the edit button or any part of it...
            && event.target !== editButton 
            && !(editButton !== null && editButton.contains(event.target as Node))

            // ...or the Thing-linking widget...
            && !(
                thingLinkingWidget
                && (
                    event.target === thingLinkingWidget
                    || thingLinkingWidget.contains(event.target as Node)
                )
            )

            // ...and the viewer isn't locked in editing mode,
            && !editingLocked

        // Disable editing.
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
            const thingsForGuid = await getThingsByGuid([guid])
            const thingId = thingsForGuid.length ? thingsForGuid[0].id : null

            // Re-Perspect to that Thing ID.
            if (graph.id === graphId && thingId) {
                rePerspectToThingId(thingId)
            }
        }
    }

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




    let notesContainerHeight = 1
    $: {
        editorTextEditedButNotSynced

        notesContainerHeight =
            Math.max(
                (
                    editing ? textEditorField?.scrollHeight ?? 0 :
                    textField?.scrollHeight ?? 0
                ),
                65
            )
    }
    

    



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
    class:outline-format={outlineFormat}
    class:make-room-for-thing-text={makeRoomForThingText}
    class:off-axis={graph.offAxis}

    style="background-color: {$uITrimColorStore};"
>
    <!-- Title. -->
    {#if !outlineFormat}
        <div
            class="title"

            style="
                margin-left: {onMobile() && !$landscapeOrientation ? 60 : 8}px;
                margin-right: {onMobile() ? 45 : 0}px;
                {
                    onMobile() ? (
                        !$landscapeOrientation ? "position: relative; top: 5px; font-size: 0.9rem;" :
                        "position: relative; top: 5px; left: 4px; font-size: 0.9rem;"
                    ) :

                    ""
                }
                font-family: {$titleFontStore ?? "Arial"};
                font-weight: {$titleFontWeightStore ?? 600};
            "
        >
            <div>{title}</div>
        </div>
    {/if}

    <!-- Container to hold either Note display or Note editor. -->
    <div
        class="notes-container"
        bind:this={notesContainer}

        style={`
            ${
                onMobile() ? "font-size: 0.5rem; padding: 0.25rem 0.5rem 0.25rem 0.5rem;" : ""
            }${
                !graph.offAxis && outlineFormat ? `flex: 1 1 ${notesContainerHeight}px;` : "flex: 1 1;"
            }
        `}
        
        
        on:dblclick={ () => {editing = true} }
    >
        <!-- Note editor. -->
        {#if !$readOnlyMode && editing}
            <NotesEditor
                currentPThingNoteText={currentThingNoteText}
                bind:currentEditorTextContent
                bind:editorTextEditedButNotSynced
                bind:textField={textEditorField}
                {fullSize}
                {outlineFormat}
                {makeRoomForThingText}
                bind:activeNotesEditorForOutliner
            />

        <!-- Note display. -->
        {:else}
            <!-- Note text display. -->
            <div
                class="notes-display"
                class:on-mobile={onMobile()}
                class:has-background-image={notesBackgroundImageUrl !== null}

                bind:this={textField}
                bind:clientHeight={textFieldClientHeight}
                
                style={notesBackgroundImageUrl ? `background-image: url(${notesBackgroundImageUrl});` : ""}

                on:scroll={() => {textFieldScrollTop = textField.scrollTop}}
            >
                {@html viewerDisplayText}
            </div>

            <!-- Jump-to-top/bottom buttons. -->
            {#if !outlineFormat}
                <TopBottomJumpButtons
                    scrollableDiv={textField}
                    scrollableDivScrollTop={textFieldScrollTop}
                    scrollableDivClientHeight={textFieldClientHeight}
                    scrollableDivScrollHeight={textFieldScrollHeight}
                />
            {/if}
        {/if}

        <!-- Saving indicator. -->
        <SavingIndicator
            saving={savingNotesToDb}
            error={savingNotesError}
        />
    </div>

    <!-- Edit button. -->
    {#if !(outlineFormat || $readOnlyMode)}
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
        padding: 0.25rem 0 0.25rem 0;
    }

    .notes-viewer.outline-format {
        border: solid 1px silver;

        padding: 0;
        gap: 0;
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
        height: 34px;

        display: flex;
        align-items: center;
    }

    .title div {
        margin: 0;

        text-align: left;
        font-size: 1.5rem;
        line-height: 1.5rem;
    }

    .notes-container {
        position: relative;

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

    .notes-display.has-background-image {
        background-size: 100% 100vh;
    }

    .notes-display.on-mobile {
        padding: 0.5rem 1rem 0.5rem 1rem;

        font-size: 0.85rem;
    }

    .notes-viewer.outline-format .notes-display {
        border-radius: 0;

        padding: 0rem 1rem 0rem 1rem;
    }

    .notes-viewer.outline-format.make-room-for-thing-text .notes-display {        
        padding: 20px 1rem 0rem 1rem;
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