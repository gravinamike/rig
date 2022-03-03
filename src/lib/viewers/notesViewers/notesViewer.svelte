<script lang="ts">
    import type { Graph } from "$lib/models/graphModels"
    import type { Thing } from "$lib/models/dbModels"
    import { thingsStore, storeGraphConstructs, retrieveGraphConstructs, graphConstructInStore } from "$lib/stores/graphStores"
    import NotesEditor from "./notesEditor.svelte"
    import { addNoteToThing } from "$lib/db/clientSide"

    export let graph: Graph

    
    let notesContainer: Element
    let editable = false

    // Get Perspective Thing.
    let pThingIds: number[] | null = null
    $: pThingIds = graph.pThingIds
    $: pThingId = pThingIds && pThingIds.length ? pThingIds[0] : null
    $: pThing = pThingId && $thingsStore && graphConstructInStore("Thing", pThingId) ?
        retrieveGraphConstructs<Thing>("Thing", pThingId) :
        null

    // Get Note title and text.
    $: title = pThing ? pThing.text : "THING NOT FOUND IN STORE"
    $: noteText = pThing && pThing.note ? pThing.note.text : "NO NOTES YET"

    async function addNote() {///////////// This should only be called prior to saving newly entered Notes for a Thing that doesn't yet have Notes.
        if (pThing && !pThing.note) {
            await addNoteToThing(pThing.id)
            // Re-store the Thing (in order to update its linker to the new Note).
            await storeGraphConstructs<Thing>("Thing", pThing.id, true)
        }
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
</script>


<svelte:body
    on:click={handlePossibleOutsideClick}
    on:keyup={handleEscape}
/>


<div class="notes-viewer">
    <h4>{title}</h4>

    <div
        on:click={addNote}
    >
        ADD NOTES
    </div>

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

        overflow-x: hidden;
        overflow-y: auto;

        background-color: white;

        text-align: left;
    }
</style>