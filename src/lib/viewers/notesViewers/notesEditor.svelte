<script lang="ts">
    // Import framework resources.
    import { onMount, onDestroy } from "svelte"

    // Import Tiptap resources
    import { Editor } from "@tiptap/core"
    import StarterKit from "@tiptap/starter-kit"
    import TextStyle from '@tiptap/extension-text-style'
    import FontFamily from "@tiptap/extension-font-family"
    import { FontSize } from "./extension-font-size"
    import { Color } from "@tiptap/extension-color"
    import Underline from "@tiptap/extension-underline"
    import TextAlign from "@tiptap/extension-text-align"
    import Link from "@tiptap/extension-link"

    // Import related widgets.
    import NotesToolbar from "./notesToolbar.svelte"
    import { notesBackgroundImageStore } from "$lib/stores";


    /**
     * @param currentPThingNoteText - The text of the Perspective Thing's Note.
     * @param currentEditorTextContent - The editor's text content as a string.
     * @param editorTextEditedButNotSynced - Indicates whether the editor's text content has been changed (excluding complete replacement because of a re-Perspect).
     * @param textField - The HTML Element of the text field.
     */
    export let currentPThingNoteText: string | null
    export let currentEditorTextContent: string | null
    export let editorTextEditedButNotSynced: boolean
    export let textField: Element

    // HTML element handles.
    let editor: Editor






    // When the editor component is created, set its text content based on the
    // Perspective Thing's Note text.
    onMount(() => {
        setContent(currentPThingNoteText || "")
    })

    const editorExtensions = [
        StarterKit,
        TextStyle,
        FontFamily,
        FontSize,
        Color,
        Underline,
        TextAlign.configure({
            types: ['heading', 'paragraph'],
        }),
        Link.configure({
            autolink: false,
            openOnClick: false,
            linkOnPaste: false
        })
    ]

    /**
     * Set-content method.
     * 
     * Sets the text content of the editor component to a given string.
     * @param content - The string which is to be the new content.
     */
    function setContent(content: string) {
        if (editorTextEditedButNotSynced) return

        // If a Tiptap editor exists, destroy it.
        editor?.destroy()

        // Create a new Tiptap editor.
        editor = new Editor({
            element: textField,
            extensions: editorExtensions,
            content: content,
            autofocus: true,
            onTransaction: () => {
                editor = editor // Force re-render so `editor.isActive` works correctly.
            },
            onUpdate: onContentEdited
        })

        // Set the content of the Tiptap editor to the supplied string.
        editor.commands.setContent(
            content,
            false,
            {
                preserveWhitespace: "full"
            }
        )

        // Set the content of the content-tracking string to the supplied string.
        currentEditorTextContent = content
    }

    function onContentEdited() {
        currentEditorTextContent = editor.getHTML()
        editorTextEditedButNotSynced = true
    }


    $: if (typeof currentPThingNoteText === "string") setContent(currentPThingNoteText)
    























    
    /**
     * Focus-editor method.
     * 
     * Gives the Tiptap editor keyboard focus.
     */
    function focusEditor() {
        const editorElement = editor.view.dom as HTMLElement
        if (editorElement !== document.activeElement) editorElement.focus()
    }

    // When the editor component is destroyed, also destroy the Tiptap editor.
    onDestroy(() => {
        if (editor) editor.destroy()
    })


    let ctrlKeyPressed = false






    $: notesBackgroundImageUrl =
        $notesBackgroundImageStore ? `customizable/background-images/${$notesBackgroundImageStore}` :
        null






</script>


<svelte:body
    on:keydown={ (event) => {if (event.key === "Control") ctrlKeyPressed = true} }
    on:keyup={ (event) => {if (event.key === "Control") ctrlKeyPressed = false} }
/>


<div class="notes-editor">
    <!-- Editor text field. -->
    <div
        class="text-field"
        class:ctrlKeyPressed
        bind:this={textField}
        on:click|preventDefault={focusEditor}
        on:wheel|stopPropagation
        on:keydown={()=>{}}

        style={
            notesBackgroundImageUrl ? `
                background-image: url(${notesBackgroundImageUrl});
                background-size: 100% 100vh;
            ` :
            ""
        }
    >
    </div>

    <!-- Editor toolbar. -->
    {#if editor}
        <NotesToolbar
            {editor}
            focusEditorMethod={focusEditor}
        />
    {/if}
</div>


<style>
    .notes-editor {
        flex: 1 1 0;

        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        text-align: center;
    }

    .text-field {
        flex: 1 1 0;

        outline: solid 2px grey;
        outline-offset: -2px;
        border-radius: 5px;

        box-sizing: border-box;
        height: 100%;
        background-color: white;

        overflow-x: hidden;
        overflow-y: auto;
        scrollbar-width: thin;

        text-align: left;
    }

    :global(.ProseMirror) {
        box-sizing: border-box;

        padding: 1rem 2rem 1rem 2rem;
    }

    :global(.ProseMirror li > p) {
        margin-top: 0;
        margin-bottom: 0;
    }

    :global(.ProseMirror:focus) {
        outline: none;
    }

    :global(.ctrlKeyPressed .ProseMirror a) {
        cursor: pointer;
    }
</style>