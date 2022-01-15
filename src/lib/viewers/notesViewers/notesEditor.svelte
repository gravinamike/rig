<script lang="ts">
    import { onMount, onDestroy } from "svelte"
    import { Editor } from "@tiptap/core"
    import StarterKit from "@tiptap/starter-kit"
    import Underline from "@tiptap/extension-underline"
    import NotesToolbar from "./notesToolbar.svelte"

    export let notesText: string


    let textField: Element
    let editor: Editor

    $: setContent(notesText)

    function setContent(content: string) {
        editor?.commands.setContent(content)
    }

    onMount(() => {
        editor = new Editor({
            element: textField,
            extensions: [ StarterKit, Underline ],
            content: '<p>Starting text...</p>',
            onTransaction: () => {
                editor = editor // Force re-render so `editor.isActive` works correctly.
            },
        })
        setContent(notesText)
    })

    onDestroy(() => {
        if (editor) editor.destroy()
    })
</script>


<main>
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
        flex: 1 1;

        background-color: #fafafa;

        display: flex;
        flex-direction: column;
        gap: 0.75rem;

        text-align: center;
    }

    .text-container {
        flex: 1 1 0;

        outline: solid 1px lightgrey;
        outline-offset: -1px;

        overflow-x: hidden;
        overflow-y: auto;

        background-color: white;

        text-align: left;
    }
</style>