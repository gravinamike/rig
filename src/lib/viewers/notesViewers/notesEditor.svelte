<script lang="ts">
    import { onMount, onDestroy } from "svelte"
    import { Editor } from "@tiptap/core"
    import StarterKit from "@tiptap/starter-kit"
    import TextStyle from '@tiptap/extension-text-style'
    import FontFamily from "@tiptap/extension-font-family"
    import { FontSize } from "./extension-font-size"
    import Underline from "@tiptap/extension-underline"
    import NotesToolbar from "./notesToolbar.svelte"

    export let noteText: string
    export let noteChanged: boolean
    export let editorContent: string


    let textField: Element
    let editor: Editor


    function setContent(content: string) {
        editor?.destroy()
        editor = new Editor({
            element: textField,
            extensions: [
                StarterKit,
                TextStyle,
                FontSize,
                FontFamily,
                Underline
            ],
            content: content,
            autofocus: true,
            onTransaction: () => {
                editor = editor // Force re-render so `editor.isActive` works correctly.
            },
            onUpdate: () => {
                noteChanged = true
                editorContent = editor.getHTML()
            }
        })
        editor.commands.setContent(content)
        editorContent = content
    }
    $: setContent(noteText)

    onMount(() => {
        setContent(noteText)
    })

    onDestroy(() => {
        if (editor) editor.destroy()
    })

    function focusEditor() {
        const editorElement = editor.view.dom as HTMLElement
        if (editorElement !== document.activeElement) editorElement.focus()
    }
</script>


<div class="notes-editor">
    <!-- Editor text field. -->
    <div
        class="text-field"
        bind:this={textField}
        on:click|preventDefault={focusEditor}
    >
    </div>

    <!-- Editor toolbar. -->
    <NotesToolbar
        {editor}
    />
</div>


<style>
    .notes-editor {
        flex: 1 1 0;

        background-color: #fafafa;

        display: flex;
        flex-direction: column;
        gap: 0.75rem;

        text-align: center;
    }

    .text-field {
        flex: 1 1 0;

        outline: solid 1px black;
        outline-offset: -1px;

        overflow-x: hidden;
        overflow-y: auto;

        background-color: white;

        padding: 0.5rem;

        text-align: left;
        
    }

    :global(.ProseMirror:focus) {
        outline: none;
    }
</style>