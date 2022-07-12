<script lang="ts">
    import type { Thing, Graph } from "$lib/models/graphModels"
    import { thingsStore, storeGraphConstructs, retrieveGraphConstructs, graphConstructInStore } from "$lib/stores/graphConstructStores"
    import NotesEditor from "./notesEditor.svelte"
    import { addNoteToThing, markNotesModified, thingsByGuid, updateNote } from "$lib/db/clientSide"
    import { hyperlinkProtocols } from "$lib/shared/constants"

    export let graph: Graph
    export let rePerspectToThingId: (thingId: number) => Promise<void>

    
    let notesContainer: Element
    let editable = false
    let noteChanged = false
    let editorContent: string

    // Get Perspective Thing.
    let pThing: Thing | null = null
    $: {
        const pThingIds = graph.pThingIds
        const pThingId = pThingIds && pThingIds.length ? pThingIds[0] : null
        pThing = pThingId && $thingsStore && graphConstructInStore("Thing", pThingId) ?
            retrieveGraphConstructs<Thing>("Thing", pThingId) :
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
		if (
            event.target !== notesContainer
            && !notesContainer.contains(event.target as Node)
        ) {
			editable = false
		}
	}
    function handleEscape(event: KeyboardEvent) {
        if (event.key === "Escape") editable = false
    }


    /* Set up triggers to either create and save, or just save, note as needed. */
    async function handleNoteChanged() {

        if (!pThing || !pThing.id) {

            return

        } else if (noteId === null) {

            await addNoteToThing(pThing.id)
            // Re-store the Thing (in order to update its linker to the new Note).
            await storeGraphConstructs<Thing>("Thing", pThing.id, true)
            noteChanged = false

        } else {
            await updateNote(noteId, editorContent)
            await markNotesModified(noteId)
            // Re-store the Thing (in order to update its linker to the updated Note).
            await storeGraphConstructs<Thing>("Thing", pThing.id, true)
            noteChanged = false

        }
    }
    $: if (noteChanged) handleNoteChanged()
    



    // Set up custom hyperlink handling for Thing-links.
    document.addEventListener("click", async event => {
        if (event.target) {
            const originElement = event.target as Element
            const hyperlink = originElement.closest("a")
            if (hyperlink) {

                let isRegularHyperlink = false
                for (const protocol of hyperlinkProtocols) {
                    if (hyperlink.href.startsWith(`${protocol}://`)) isRegularHyperlink = true
                }

                if (!isRegularHyperlink) {

                    event.preventDefault()
                    const notesViewer = hyperlink.closest(".notes-viewer")
                    if (notesViewer) {
                        const classes = (notesViewer as HTMLDivElement).classList
                        const graphId = Number(classes[1][classes[1].length - 1])

                        console.log(`You clicked ${hyperlink.href} for viewer ${graphId}`)

                        const guid = hyperlink.href.split("//")[1]

                        const thingsForGuid = await thingsByGuid([guid])
                        const thingId = thingsForGuid.length ? thingsForGuid[0].id : null

                        if (graph.id === graphId && thingId) {
                            rePerspectToThingId(thingId)
                        }
                    }

                }
            }
        }
    })
</script>


<svelte:body
    on:click={handlePossibleOutsideClick}
    on:keyup={handleEscape}
/>


<div class="notes-viewer graph-{graph.id}">
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