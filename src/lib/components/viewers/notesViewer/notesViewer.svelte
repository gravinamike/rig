<script lang="ts">
    import { onMount, onDestroy } from "svelte"
    import { Editor } from "@tiptap/core"
    import StarterKit from "@tiptap/starter-kit"
    import Underline from "@tiptap/extension-underline"
    import NotesToolbar from "$lib/components/viewers/notesViewer/notesToolbar.svelte"


    let textField: Element
    let editor: Editor

    onMount(() => {
        editor = new Editor({
            element: textField,
            extensions: [ StarterKit, Underline ],
            content: '<p>Starting text...</p>',
            onTransaction: () => {
                editor = editor // Force re-render so `editor.isActive` works correctly.
            },
        })
    })

    onDestroy(() => {
        if (editor) editor.destroy()
    })
</script>


<main>
    <h4>Title</h4>

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

        overflow-x: hidden;
        overflow-y: auto;

        background-color: white;

        text-align: left;
    }
</style>