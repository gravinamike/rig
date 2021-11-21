<script lang="ts">
    import type { Editor } from '@tiptap/core'

    export let editor: Editor
</script>


{#if editor}
    <div class="notes-toolbar">
        <!-- Basic formatting. -->
        <div class="button-group">
            <div class="button"
                on:click={() => editor.chain().focus().toggleBold().run()}
                class:active={editor.isActive('bold')}
                style="font-weight: bold;"
            >
                Bold
            </div>

            <div class="button"
                on:click={() => editor.chain().focus().toggleItalic().run()}
                class:active={editor.isActive('italic')}
                style="font-style: italic;"
            >
                Italic
            </div>

            <div class="button"
                on:click={() => editor.chain().focus().toggleUnderline().run()}
                class:active={editor.isActive('underline')}
                style="text-decoration: underline;"
            >
                Underline
            </div>

            <div class="button"
                on:click={() => editor.chain().focus().toggleStrike().run()}
                class:active={editor.isActive('strike')}
                style="text-decoration: line-through;"
            >
                Strikethrough
            </div>
        </div>

        <!-- Headers -->
        <div class="button-group">
            <div class="button"
                on:click={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                class:active={editor.isActive('heading', { level: 1 })}
            >
                h1
            </div>

            <div class="button"
                on:click={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                class:active={editor.isActive('heading', { level: 2 })}
            >
                h2
            </div>

            <div class="button"
                on:click={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                class:active={editor.isActive('heading', { level: 3 })}
            >
                h3
            </div>

            <div class="button" on:click={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
                class:active={editor.isActive('heading', { level: 4 })}
            >
                h4
            </div>

            <div class="button"
                on:click={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
                class:active={editor.isActive('heading', { level: 5 })}
            >
                h5
            </div>

            <div class="button"
                on:click={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
                class:active={editor.isActive('heading', { level: 6 })}
            >
                h6
            </div>
        </div>

        <!-- Lists. -->
        <div class="button-group">
            <div class="button"
                on:click={() => editor.chain().focus().toggleBulletList().run()}
                class:active={editor.isActive('bulletList')}
            >
                Bullet list
            </div>

            <div class="button"
                on:click={() => editor.chain().focus().toggleOrderedList().run()}
                class:active={editor.isActive('orderedList')}
            >
                Ordered list
            </div>
        </div>

        <!-- Block formatting. -->
        <div class="button-group">
            <div class="button"
                on:click={() => editor.chain().focus().toggleBlockquote().run()}
                class:active={editor.isActive('blockquote')}
            >
                Blockquote
            </div>

            <div class="button"
                on:click={() => editor.chain().focus().toggleCode().run()}
                class:active={editor.isActive('code')}
            >
                Code
            </div>     

            <div class="button"
                on:click={() => editor.chain().focus().toggleCodeBlock().run()}
                class:active={editor.isActive('codeBlock')}
            >
                Code block
            </div>
        </div>

        <!-- Other formatting. -->
        <div class="button-group">
            <div class="button"
                on:click={() => editor.chain().focus().setParagraph().run()}
                class:active={editor.isActive('paragraph')}
            >
                Paragraph
            </div>

            <div class="button"
                on:click={() => editor.chain().focus().setHorizontalRule().run}
            >
                Horizontal rule
            </div>

            <div class="button"
                on:click={() => editor.chain().focus().setHardBreak().run()}
            >
                Hard break
            </div>
        </div>

        <!-- Clear and undo/redo. -->
        <div class="button-group">
            <div class="button"
                on:click={() => editor.chain().focus().unsetAllMarks().run()}
            >
                Clear marks
            </div>

            <div class="button"
                on:click={() => editor.chain().focus().clearNodes().run()}
            >
                Clear nodes
            </div>

            <div class="button"
                on:click={() => editor.chain().focus().undo().run()}
            >
                Undo
            </div>

            <div class="button"
                on:click={() => editor.chain().focus().redo().run()}
            >
                Redo
            </div>
        </div>
    </div>
{/if}


<style>
    .notes-toolbar {
        display: flex;
        flex-direction: column;
    }

    .button-group {
        display: flex;
        flex-direction: row;
        padding: 0.25rem;
        gap: 0.5rem;
    }

    .button {
        border-radius: 3px;
        outline: solid 1px lightgrey;

        padding: 0.1rem;

        font-size: 0.75rem;

        cursor: default
    }

    .button:hover {
        outline: solid 2px lightgrey; 
    }

    .button.active {
        background-color: grey;
    }
</style>