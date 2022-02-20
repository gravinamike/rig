<script lang="ts">
    import type { Graph } from "$lib/models/graphModels"
    import type { Thing } from "$lib/models/dbModels"
    import { thingsStore, storeGraphConstructs, retrieveGraphConstructs, graphConstructInStore } from "$lib/stores/graphStores"
    import { Toggle } from "$lib/widgets/layoutWidgets"
    import NotesEditor from "./notesEditor.svelte"
    import { addNoteToThing } from "$lib/db/clientSide"

    export let graph: Graph

    
    let editable: false

    let pThingIds: number[] | null = null
    $: pThingIds = graph.pThingIds
    $: pThingId = pThingIds && pThingIds.length ? pThingIds[0] : null
    $: pThing = pThingId && $thingsStore && graphConstructInStore("Thing", pThingId) ?
        retrieveGraphConstructs<Thing>("Thing", pThingId) :
        null

    $: title = pThing ? pThing.text : "THING NOT FOUND IN STORE"
    $: notesText = pThing && pThing.note ? pThing.note.text : "NO NOTES YET"

    async function addNote() {///////////// This should only be called prior to saving newly entered Notes for a Thing that doesn't yet have Notes.
        if (pThing && !pThing.note) {
            await addNoteToThing(pThing.id)
            // Re-store the Thing (in order to update its linker to the new Note).
            await storeGraphConstructs<Thing>("Thing", pThing.id, true)
        }
    }
</script>


<main>
    <h4>{title}</h4>

    <div
        on:click={addNote}
    >
        ADD NOTES
    </div>

    <div class="editable-toggle {editable ? "toggled": ""}">
        Editable
        <Toggle
            bind:toggled={editable}
        />
    </div>

    {#if editable}
        <NotesEditor
            {notesText}
        />
    {:else}
        <div class="notes-display">
            {@html notesText}
        </div>
    {/if}
    
</main>


<style>
    main {
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

    .editable-toggle {
        flex: 0 0;

        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        gap: 5px;

        font-size: 0.75rem;
        color: lightgrey;
    }

    .editable-toggle.toggled {
        color: darkgrey;
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