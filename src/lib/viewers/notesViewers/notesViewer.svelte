<script lang="ts">
    import type { Graph } from "$lib/models/graphModels"
    import type { ThingDbModel } from "$lib/models/dbModels"
    import { thingsStore, storeGraphConstructs, retrieveGraphConstructs, graphConstructInStore } from "$lib/stores/graphStores"
    import NotesEditor from "./notesEditor.svelte"
    import { addNoteToThing, markNotesModified, updateNote } from "$lib/db/clientSide"

    export let graph: Graph

    
    let notesContainer: Element
    let editable = false
    let noteChanged = false
    let editorContent: string

    // Get Perspective Thing.
    let pThing: ThingDbModel | null = null
    $: {
        const pThingIds = graph.pThingIds
        const pThingId = pThingIds && pThingIds.length ? pThingIds[0] : null
        pThing = pThingId && $thingsStore && graphConstructInStore("Thing", pThingId) ?
            retrieveGraphConstructs<ThingDbModel>("Thing", pThingId) :
            null
    }

    // Get Note title and text.
    $: title = pThing ? pThing.text : "THING NOT FOUND IN STORE"
    $: noteId = pThing?.note?.id || null
    let noteText = ""
    $: if (!editable) noteText = pThing?.note?.text || "" // Don't reset the text if the text editor is open.
    // When Perspective changes, reset Note-changed flag.
    $: {
        noteText
        noteChanged = false
    }

    // Handling outside clicks and escape key to stop editing.
	function handlePossibleOutsideClick(event: MouseEvent) {
		if (event.target !== notesContainer && !notesContainer.contains(event.target as Node)) {
			editable = false
		}
	}
    function handleEscape(event: KeyboardEvent) {
        if (event.key === "Escape") editable = false
    }


    /* Set up triggers to either create and save, or just save, note as needed. */
    async function handleNoteChanged() {

        if (!pThing) {

            return

        } else if (noteId === null) {

            await addNoteToThing(pThing.id)
            // Re-store the Thing (in order to update its linker to the new Note).
            await storeGraphConstructs<ThingDbModel>("Thing", pThing.id, true)
            noteChanged = false

        } else {
            await updateNote(noteId, editorContent)
            await markNotesModified(noteId)
            // Re-store the Thing (in order to update its linker to the updated Note).
            await storeGraphConstructs<ThingDbModel>("Thing", pThing.id, true)
            noteChanged = false

        }
    }
    $: if (noteChanged) handleNoteChanged()
    

</script>


<svelte:body
    on:click={handlePossibleOutsideClick}
    on:keyup={handleEscape}
/>


<div class="notes-viewer">
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
                {noteText}
                bind:noteChanged
                bind:editorContent
            />
        <!-- Note display. -->
        {:else}
            <div class="notes-display">
                {@html noteText}
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