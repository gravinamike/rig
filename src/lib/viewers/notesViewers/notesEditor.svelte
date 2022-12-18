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


    /**
     * @param pThingNoteText - The text of the Perspective Thing's Note.
     * @param editorTextContentChanged - Indicates whether the editor's text content has been changed.
     * @param editorTextContent - The editor's text content as a string.
     */
    export let pThingNoteText: string
    export let editorTextContentChanged: boolean
    export let editorTextContent: string


    // HTML element handles.
    let textField: Element
    let editor: Editor

    // When the editor component is created, set its text content based on the
    // Perspective Thing's Note text.
    onMount(() => {
        setContent(pThingNoteText)
    })

    // When the Perspective Thing's Note text changes (usually because the Graph
    // is re-Perspected), set the editor component's text content based on it.
    $: setContent(pThingNoteText)

    

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
            onUpdate: () => {
                editorTextContentChanged = true
                editorTextContent = editor.getHTML()
            }
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
        editorTextContent = content
    }
    

    
    
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
</script>


<div class="notes-editor">
    <!-- Editor text field. -->
    <div
        class="text-field"
        bind:this={textField}
        on:click|preventDefault={focusEditor}
        on:keydown={()=>{}}
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