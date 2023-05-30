<script lang="ts">
    import type { Editor } from "@tiptap/core"
    import { fontSizes, headerLevels } from "$lib/shared/constants"
    import { enableThingLinking, enableTextHyperlinking, fontNames, uIBackgroundColorStore, notesToolbarExpandedStore, landscapeOrientation } from "$lib/stores"
    import CommandPalette from "$lib/widgets/layoutWidgets/commandPalette/commandPalette.svelte"
    import { onMobile } from "$lib/shared/utility"
    import { saveGraphConfig } from "$lib/shared/config"


    export let editor: Editor
    export let focusEditorMethod: () => void


    let expanded = $notesToolbarExpandedStore
    
    function selectedFontFamily(): string | null {
        return editor.getAttributes("textStyle").fontFamily || null
    }
    let currentSelectionFontFamily: string | null
    $: if (editor) currentSelectionFontFamily = selectedFontFamily()
    
    function selectedFontSize(): number | null {
        let selectedFontSize = editor.getAttributes("textStyle").fontSize || null
        if (typeof selectedFontSize === "string") {
            selectedFontSize = Number(selectedFontSize.replace("pt", ""))
        }
        return selectedFontSize
    }
    let currentSelectionFontSize: number | null
    $: if (editor) currentSelectionFontSize = selectedFontSize()

    function selectedHeaderLevel(): 1 | 2 | 3 | 4 | 5 | 6 | null {
        let selectedHeaderLevel = editor.getAttributes("heading").level || null
        return selectedHeaderLevel
    }
    let currentSelectionHeaderLevel: 1 | 2 | 3 | 4 | 5 | 6 | null
    $: if (editor) currentSelectionHeaderLevel = selectedHeaderLevel()

    let colorPicker: HTMLInputElement
    function selectedColor(): string {
        let selectedColor = editor.getAttributes("textStyle").color || null
        return selectedColor
    }
    let currentSelectionColor: string
    $: if (editor) currentSelectionColor = selectedColor()

    function isThingLink(): boolean {
        return (
            editor.isActive('link')
            && editor.getAttributes("link").href.startsWith("graph://")
        )
    }

    $: commandButtonInfos = [
        // Basic formatting.
        {
            text: "Bold text",
            iconName: null,
            iconHtml: `<span style="font-weight: bold;">B</span>`,
            isActive: editor.isActive('bold'),
            onClick: () => editor.chain().focus().toggleBold().run()
        },
        {
            text: "Italic text",
            iconName: null,
            iconHtml: `<span style="font-style: italic;">I</span>`,
            isActive: editor.isActive('italic'),
            onClick: () => editor.chain().focus().toggleItalic().run()
        },
        {
            text: "Underline text",
            iconName: null,
            iconHtml: `<span style="text-decoration: underline;">U</span>`,
            isActive: editor.isActive('underline'),
            onClick: () => editor.chain().focus().toggleUnderline().run()
        },
        {
            text: "Strikethrough text",
            iconName: null,
            iconHtml: `<span style="text-decoration: line-through;">S</span>`,
            isActive: editor.isActive('strike'),
            onClick: () => editor.chain().focus().toggleStrike().run()
        },

        // Text alignment.
        {
            text: "Align left",
            iconName: "left-align",
            iconHtml: null,
            isActive: editor.isActive({ textAlign: 'left' }),
            onClick: () => editor.chain().focus().setTextAlign('left').run()
        },
        {
            text: "Center",
            iconName: "center-align",
            iconHtml: null,
            isActive: editor.isActive({ textAlign: 'center' }),
            onClick: () => editor.chain().focus().setTextAlign('center').run()
        },
        {
            text: "Align right",
            iconName: "right-align",
            iconHtml: null,
            isActive: editor.isActive({ textAlign: 'right' }),
            onClick: () => editor.chain().focus().setTextAlign('right').run()
        },
        {
            text: "Justify",
            iconName: "justify",
            iconHtml: null,
            isActive: editor.isActive({ textAlign: 'justify' }),
            onClick: () => editor.chain().focus().setTextAlign('justify').run()
        },

        // Lists.
        {
            text: "Bullet list",
            iconName: null,
            iconHtml: `
                <ul style="font-size: 6px; line-height: 5px; font-weight: 1000; padding-left: 4px; padding-top: 0px;">
                    <li>----
                    <li>----
                    <li>----
                </ul>
            `,
            isActive: editor.isActive('bulletList'),
            onClick: () => editor.chain().focus().toggleBulletList().run()
        },
        {
            text: "Ordered list",
            iconName: null,
            iconHtml: `
                <ol style="font-size: 6px; line-height: 5.5px; font-weight: 1000; padding-left: 7px; padding-top: 0px;">
                    <li>----
                    <li>----
                    <li>----
                </ol>
            `,
            isActive: editor.isActive('orderedList'),
            onClick: () => editor.chain().focus().toggleOrderedList().run()
        },
        {
            text: "Blockquote",
            iconName: null,
            iconHtml: `
                <div style="line-height: 5.5px; font-weight: 700; padding-left: 0px; padding-top: 5px;">
                    “<span style="font-size: 5px;">&nbsp;</span>”
                </div>
            `,
            isActive: editor.isActive('blockquote'),
            onClick: () => editor.chain().focus().toggleBlockquote().run()
        },

        // Block formatting.
        {
            text: "Code",
            iconName: null,
            iconHtml: `
                <div style="font-size: 11px; line-height: 4px; font-weight: 700; padding-left: 0px; padding-top: 3px;">
                    &#60;<span style="font-size: 5px;">&nbsp;</span>&#62;
                </div>
            `,
            isActive: editor.isActive('code'),
            onClick: () => editor.chain().focus().toggleCode().run()
        },
        {
            text: "Code block",
            iconName: null,
            iconHtml: `
                <div style="font-size: 5px; line-height: 5px; font-weight: 1000; padding-left: 0px; padding-top: 0px;">
                    -------<br>
                    <span style="font-size: 6.5px; font-weight: 3000;">&nbsp;&#60;&#62;</span><br>
                    -------
                </div>
            `,
            isActive: editor.isActive('codeBlock'),
            onClick: () => editor.chain().focus().toggleCodeBlock().run()
        },

        // Other formatting.
        {
            text: "Horizontal rule",
            iconName: null,
            iconHtml: `
                <div style="font-size: 5px; line-height: 5px; font-weight: 1000;">
                    ----------
                </div>
            `,
            isActive: false,
            onClick: () => editor.chain().focus().setHorizontalRule().run()
        },
        {
            text: "Hard break",
            iconName: null,
            iconHtml: `
                <div style="font-size: 5px; line-height: 3px; font-weight: 1000; padding-left: 0px; padding-top: 0px;">
                    -------<br>
                    -------<br>
                    <br>
                    -------<br>
                    -------
                </div>
            `,
            isActive: false,
            onClick: () => editor.chain().focus().setHardBreak().run()
        },

        // Undo/redo and clear formatting.
        {
            text: "Undo",
            iconName: "undo",
            iconHtml: null,
            isActive: false,
            onClick: () => editor.chain().focus().undo().run()
        },
        {
            text: "Redo",
            iconName: "redo",
            iconHtml: null,
            isActive: false,
            onClick: () => editor.chain().focus().redo().run()
        },
        {
            text: "Clear formatting",
            iconName: "clean",
            iconHtml: null,
            isActive: false,
            onClick: () => {
                editor.chain().focus().unsetAllMarks().run()
                editor.chain().focus().clearNodes().run()
            }
        },

        // Linking.
        {
            text: "Hyperlink",
            iconName: "link",
            iconHtml: null,
            isActive: (
                editor.isActive('link')
                && !isThingLink()
            ),
            onClick: () => {
                if (editor.isActive('link') && !isThingLink()) {
                    editor.chain().focus().unsetLink().run()
                } else {
                    enableTextHyperlinking(editor, focusEditorMethod)
                }
            }
        },
        {
            text: "Thing link",
            iconName: "thing-link",
            iconHtml: null,
            isActive: (
                editor.isActive('link')
                && isThingLink()
            ),
            onClick: () => {
                if (editor.isActive('link') && isThingLink()) {
                    editor.chain().focus().unsetLink().run()
                } else {
                    enableThingLinking(editor, focusEditorMethod)
                }
            }
        }
    ]

    function handleExpandButton() {
        expanded = !expanded
        notesToolbarExpandedStore.set(expanded)
        saveGraphConfig()
    }
</script>


{#if editor}
    <div
        class="notes-toolbar"
        class:on-mobile={onMobile()}

        style="background-color: {$uIBackgroundColorStore};"
    >

        <!-- Font family, size, and header level. -->
        <div class="button-group">
            <select
                class="font-picker"

                value={currentSelectionFontFamily ? currentSelectionFontFamily : "Arial"}
            >
                {#each $fontNames as fontName}
                    <option
                        value={fontName}
                        on:click={() => editor.chain().focus().setFontFamily(fontName).run()}
                    >
                        {fontName}
                    </option>
                {/each}
            </select>

            <select
                class="font-size-picker"

                value={currentSelectionFontSize ? currentSelectionFontSize : 12}
            >
                {#each fontSizes as fontSize}
                    <option
                        value={fontSize}
                        on:click={() => editor.chain().focus().setFontSize(fontSize).run()}
                    >
                        {fontSize}
                    </option>
                {/each}
            </select>

            <select
                class="level-picker"

                value={currentSelectionHeaderLevel === null ? "Body" : `H${currentSelectionHeaderLevel}`}
            >
                {#each headerLevels as headerLevel}
                    <option
                        value={headerLevel === null ? "Body" : `H${headerLevel}`}
                        on:click={() => {
                            if (headerLevel === null) {
                                editor.chain().focus().setHeading({ level: 1 }).run()
                                editor.chain().focus().toggleHeading({ level: 1 }).run()
                            } else {
                                editor.chain().focus().toggleHeading({ level: headerLevel }).run()
                            }
                        }}
                    >
                        {headerLevel === null ? "Body" : `H${headerLevel}`}
                    </option>
                {/each}
            </select>

            <input
                class="color-picker"
                type="color"
                bind:this={colorPicker}
                value={currentSelectionColor === null ? "#000000" : currentSelectionColor}

                on:change={ () => editor.chain().focus().setColor(colorPicker.value).run() }
            >
        </div>

        <CommandPalette
            {commandButtonInfos}
            buttonSize={onMobile() ? 20 : 25}
            maxRowLength={
                onMobile() ? (
                    !$landscapeOrientation ? 11 :
                    8
                ):
                20
            }
            startPadding={onMobile() ? 8 : 10}
            showText={onMobile() || !expanded ? false : true}
            forceRows={expanded ? null : 2}
        />

        <div
            class="expand-edit-buttons"

            style={
                onMobile() ? (
                    !$landscapeOrientation ? "width: 74px;" :
                    "width: 102px;"
                ) :
                "width: 51px;"
            }
        >
            <div
                class="expand-button"
                class:expanded

                on:click={handleExpandButton}
                on:keydown={() => {}}
            >
                {#if expanded}
                    -
                {:else}
                    +
                {/if}
            </div>
        </div>
    </div>
{/if}


<style>
    .notes-toolbar {
        flex: 0 0;

        border-radius: 5px;

        position: relative;

        display: flex;
        flex-direction: row;
        padding: 0.5rem;
        gap: 0.25rem;
    }

    .notes-toolbar.on-mobile {
        width: 101%;

        padding: 0.1rem;
        gap: 0.05rem;
    }

    .button-group {
        position: absolute;
        left: 14px;
        top: 14px;
        z-index: 1;

        display: flex;
        flex-direction: row;
        gap: 5px;
    }

    .notes-toolbar.on-mobile .button-group {
        left: 7.5px;
        top: 7.5px;
    }

    select, input {
        height: 25px;

        font-size: 0.73rem;
    }

    .notes-toolbar.on-mobile select, .notes-toolbar.on-mobile input {
        height: 20px;

        font-size: 0.65rem;
    }

    .font-picker {
        width: 145px;
    }

    .notes-toolbar.on-mobile .font-picker {
        width: 74px;
    }

    .font-size-picker {
        width: 55px;
    }

    .notes-toolbar.on-mobile .font-size-picker {
        width: 38px;
    }

    .level-picker {
        width: 55px;

        padding: 2.5px;
    }

    .notes-toolbar.on-mobile .level-picker {
        width: 48px;
    }

    .color-picker {
        width: 25px;

        padding: 2.5px;
    }

    .notes-toolbar.on-mobile .color-picker {
        width: 20px;
    }

    .expand-edit-buttons {
        height: 100%;

        align-items: center;
    }

    .expand-button {
        font-size: 1.5rem;
        font-weight: 600;
        color: grey;

        cursor: pointer;
    }

    .notes-toolbar.on-mobile .expand-button {
        margin-top: -0.15rem;;
    }

    .expand-button.expanded {
        margin-top: -0.25rem;
        font-size: 1.75rem;
    }

    .notes-toolbar.on-mobile .expand-button.expanded {
        margin-top: -0.35rem;;
    }

    .expand-button:hover {
        color: dimgrey;
    }

    .expand-button:active {
        color: black;
    }
</style>