<script lang="ts">
    import type { Graph } from "$lib/shared/graph/graph"
    import type { Thing } from "$lib/shared/graph/graphDbConstructs"
    import { onMount, onDestroy } from "svelte"
    import { thingsStore, retrieveGraphConstructs, graphConstructInStore } from "$lib/shared/stores/graphStores"
    import { Editor } from "@tiptap/core"
    import StarterKit from "@tiptap/starter-kit"
    import Underline from "@tiptap/extension-underline"
    import NotesToolbar from "$lib/components/viewers/notesViewer/notesToolbar.svelte"

    export let graph: Graph


    let textField: Element
    let editor: Editor

    let pThingIds: number[] | null = null
    $: graph.pThingIds().then(ids => pThingIds = ids)
    $: pThingId = pThingIds && pThingIds.length ? pThingIds[0] : null
    $: pThing = pThingId && $thingsStore && graphConstructInStore("Thing", pThingId) ?
        retrieveGraphConstructs<Thing>("Thing", pThingId) :
        null

    $: title = pThing ? pThing.text : "THING NOT FOUND IN STORE"
    $: notesText = pThing && pThing.note ? pThing.note.text : "NO NOTES YET"
    $: setContent(notesText)

    function setContent(content: string) {
        editor?.commands.setContent(content)
    }

    onMount(() => {
        editor = new Editor({
            element: textField,
            extensions: [ StarterKit, Underline ],
            content: '<p>Starting text...</p>',
            onTransaction: ({editor: Editor, transaction}) => {
                editor = editor // Force re-render so `editor.isActive` works correctly.
            },
        })
    })

    onDestroy(() => {
        if (editor) editor.destroy()
    })
</script>


<main>
    <h4>{title}</h4>

    <div class="text-container">
        <div class="text-field"
            bind:this={textField}
        />
    </div>

    <NotesToolbar
        {editor}
    />
</main>


<style>
    main {
        outline: solid 1px lightgrey;
        outline-offset: -1px;

        box-sizing: border-box;
        width: 250px;
        height: 100%;
        background-color: #fafafa;

        display: flex;
        flex-direction: column;
        padding: 0.75rem;
        gap: 0.75rem;

        text-align: center;
    }

    h4 {
        margin: 0;
    }

    .text-container {
        flex-grow: 1;

        outline: solid 1px lightgrey;
        outline-offset: -1px;

        overflow-x: hidden;
        overflow-y: auto;

        background-color: white;

        text-align: left;
    }
</style>