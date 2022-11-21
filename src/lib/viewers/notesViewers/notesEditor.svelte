<script lang="ts">
    import { onMount, onDestroy } from "svelte"
    import { Editor } from "@tiptap/core"
    import StarterKit from "@tiptap/starter-kit"
    import TextStyle from '@tiptap/extension-text-style'
    import FontFamily from "@tiptap/extension-font-family"
    import { FontSize } from "./extension-font-size"
    import { Color } from "@tiptap/extension-color"
    import Underline from "@tiptap/extension-underline"
    import Link from "@tiptap/extension-link"
    import NotesToolbar from "./notesToolbar.svelte"

    export let noteText: string
    export let noteChanged: boolean
    export let editorContent: string


    let textField: Element
    let editor: Editor


    function setContent(content: string) {
        if (noteChanged) return

        editor?.destroy()
        editor = new Editor({
            element: textField,
            extensions: [
                StarterKit,
                TextStyle,
                FontFamily,
                FontSize,
                Color,
                Underline,
                Link.configure({
                    autolink: false,
                    openOnClick: false,
                    linkOnPaste: false
                })
            ],
            content: content,
            autofocus: true,
            onTransaction: () => {
                editor = editor // Force re-render so `editor.isActive` works correctly.
            },
            onUpdate: () => {
                noteChanged = true
                editorContent = editor.getHTML()
                noteText = editorContent
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
        focusEditorMethod={focusEditor}
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

        box-sizing: border-box;
        background-color: white;

        padding: 0.5rem;

        overflow-x: hidden;
        overflow-y: auto;

        text-align: left;
        
    }

    :global(.ProseMirror li > p) {
        margin-top: 0;
        margin-bottom: 0;
    }

    :global(.ProseMirror:focus) {
        outline: none;
    }
</style>