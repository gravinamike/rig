<script lang="ts">
    // Import SvelteKit framework resources.
    import { onMount, onDestroy, tick } from "svelte"

    // Import stores.
    import { notesBackgroundImageStore, enableTextHyperlinking, enableThingLinking } from "$lib/stores"

    // Import Tiptap resources.
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
    import { onMobile } from "$lib/shared/utility"
    import TopBottomJumpButtons from "./topBottomJumpButtons.svelte"



    /**
     * @param currentPThingNoteText - The text of the Perspective Thing's Note.
     * @param currentEditorTextContent - The editor's text content as a string.
     * @param editorTextEditedButNotSynced - Indicates whether the editor's text content has been changed (excluding complete replacement because of a re-Perspect).
     * @param textField - The HTML Element of the text field.
     * @param fullSize: Whether the viewer's menu is opened to full-size.
     * @param outlineFormat - Whether the Notes editor that this toolbar is part of is in a Graph outline widget.
     * @param activeNotesEditorForOutliner - The active Tiptap editor (if any) for the Graph outline widget this belongs to (if any).
     */
    export let currentPThingNoteText: string | null
    export let currentEditorTextContent: string | null
    export let editorTextEditedButNotSynced: boolean
    export let textField: Element
    export let fullSize: boolean
    export let outlineFormat: boolean
    export let makeRoomForThingText = false
    export let editor: Editor
    export let activeNotesEditorForOutliner: Editor | null



    // HTML element handles.
    let editorElement: HTMLElement
    let textFieldScrollTop = 0
    let textFieldClientHeight = 0
    let textFieldScrollHeight = 0


    // The set of editor extensions for the TipTap editor.
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


    // Set the background image URL if one is set in the configuration file.
    $: notesBackgroundImageUrl =
        $notesBackgroundImageStore ? `customizable/background-images/${$notesBackgroundImageStore}` :
        null

    // When the current Perspective Thing's Note text exists (isn't null), set the content of the
    // editor to that Note text.
    $: if (typeof currentPThingNoteText === "string") setContent(currentPThingNoteText)


    // Whether the control key is currently pressed.
    let ctrlKeyPressed = false

    // Set up hotkeys for Thing-linking and hyperlinking.
    window.addEventListener("keydown", (event)=> {
        // If the editor or editor HTML element are null or undefined, abort.
        if (!editor || !editorElement ) return

        // If the editor isn't focused, abort.
        if (event.target !== editorElement && !editorElement.contains(event.target as Node)) {
            return
        }

        // Thing-link hotkey.
        if (event.key === "l" && (event.ctrlKey || event.metaKey)) {
            event.preventDefault()

            if (editor.isActive('link') && isThingLink()) {
                    editor.chain().focus().unsetLink().run()
            } else {
                enableThingLinking(editor, focusEditor)
            }
        }

        // Hyperlink hotkey.
        else if (event.key === "k" && (event.ctrlKey || event.metaKey)) {
            event.preventDefault()

            if (editor.isActive('link') && !isThingLink()) {
                editor.chain().focus().unsetLink().run()
            } else {
                enableTextHyperlinking(editor, focusEditor)
            }
        }

        // Strikethrough hotkey.
        else if (event.key === "d" && (event.ctrlKey || event.metaKey)) {
            event.preventDefault()

            editor.chain().focus().toggleStrike().run()
        }

        // Un-format hotkey.
        else if (event.key === " " && (event.ctrlKey || event.metaKey)) {
            event.preventDefault()

            editor.chain().focus().unsetAllMarks().run()
            editor.chain().focus().clearNodes().run()
        }
    })
    

    /**
     * Focus-editor method.
     * 
     * Gives the Tiptap editor keyboard focus.
     */
    function focusEditor() {
        const editorElement = editor.view.dom as HTMLElement
        if (editorElement !== document.activeElement) editorElement.focus()
    }

    /**
     * Set-content method.
     * 
     * Sets the text content of the editor component to a given string. To be used when loading
     * text from a new Perspective Thing.
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
            autofocus: onMobile() ? false : true,
            onTransaction: () => {
                editor = editor // Force re-render so `editor.isActive` works correctly.
            },
            onUpdate: onContentEdited,
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

        textFieldScrollHeight = textField?.scrollHeight || 0
    }

    /**
     * On-content-edited method.
     * 
     * When the text in the editor is changed (by the user), set the flag that indicates the text
     * needs to be synced, and scroll the text field if necessary.
     */
    async function onContentEdited() {
        // Update the `currentEditorTextContent` variable to reflect the HTML content of the
        // editor.
        currentEditorTextContent = editor.getHTML()

        // Set the flag that indicates the text needs to be synced on the back-end.
        editorTextEditedButNotSynced = true

        // Scroll the text field if necessary.
        await tick()
        textFieldScrollHeight = textField?.scrollHeight || 0
    }

    /**
     * Is-Thing-link method.
     * 
     * Determines if the currently-selected text is a link to a Thing in the current Graph.
     */
    function isThingLink(): boolean {
        return (
            editor.isActive('link')
            && editor.getAttributes("link").href.startsWith("graph://")
        )
    }

    

    // When the editor component is created, set its text content based on the
    // Perspective Thing's Note text.
    onMount(() => {
        setContent(currentPThingNoteText || "")
    })

    // When the editor component is destroyed, also destroy the Tiptap editor.
    onDestroy(() => {
        if (editor) editor.destroy()

        if (activeNotesEditorForOutliner === editor) {
            activeNotesEditorForOutliner = null
        }
    })
</script>


<!-- Set control-key tracking on the page body. -->
<svelte:body
    on:keydown={ (event) => {if (event.key === "Control") ctrlKeyPressed = true} }
    on:keyup={ (event) => {if (event.key === "Control") ctrlKeyPressed = false} }
/>


<!-- Notes editor. -->
<div
    class="notes-editor"
    class:on-mobile={onMobile()}
    class:outline-format={outlineFormat}
    class:make-room-for-thing-text={makeRoomForThingText}

    bind:this={editorElement}
>
    <!-- Editor text field. -->
    <div
        class="text-field"
        class:on-mobile={onMobile()}
        class:has-background-image={notesBackgroundImageUrl !== null}
        class:ctrlKeyPressed

        bind:this={textField}
        bind:clientHeight={textFieldClientHeight}
        
        on:click|preventDefault={focusEditor}
        on:wheel|stopPropagation
        on:keydown={()=>{}}

        style={notesBackgroundImageUrl ? `background-image: url(${notesBackgroundImageUrl});` : ""}

        on:scroll={() => {textFieldScrollTop = textField.scrollTop}}
    />

    <!-- Jump-to-top/bottom buttons. -->
    <div
        class="jump-buttons-container"
        
        style="height: {textFieldClientHeight}px;"
    >
        <TopBottomJumpButtons
            scrollableDiv={textField}
            scrollableDivScrollTop={textFieldScrollTop}
            scrollableDivClientHeight={textFieldClientHeight}
            scrollableDivScrollHeight={textFieldScrollHeight}
        />
    </div>

    <!-- Editor toolbar. -->
    {#if !outlineFormat && editor}
        <NotesToolbar
            {editor}
            {fullSize}
            focusEditorMethod={focusEditor}
            isThingLinkMethod={isThingLink}
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

    .notes-editor.on-mobile {
        margin-top: -0.25rem;
        padding: 0.25rem 0 0.25rem 0;
        gap: 0.25rem;
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

    .notes-editor.outline-format .text-field {
        outline: unset;
        outline-offset: unset;
        border-radius: 0;
    }

    .text-field.has-background-image {
        background-size: 100% 100vh;
    }

    .jump-buttons-container {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;

        pointer-events: none;
    }

    :global(.ProseMirror) {
        box-sizing: border-box;

        padding: 1rem 2rem 1rem 2rem;
    }

    :global(.text-field.on-mobile .ProseMirror) {
        padding: 0.5rem 1rem 0.5rem 1rem;

        font-size: 0.85rem;
    }













    :global(.notes-editor.outline-format .text-field .ProseMirror) {
        padding: 0rem 1rem 0rem 1rem;
    }

    :global(.notes-editor.outline-format.make-room-for-thing-text .text-field .ProseMirror) {
        padding: 20px 1rem 0rem 1rem;
    }
















    :global(.text-field.on-mobile ul) {
        padding-left: 1.5rem;
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