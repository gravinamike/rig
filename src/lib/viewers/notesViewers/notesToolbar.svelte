<script lang="ts">
    // Import types.
    import type { Editor } from "@tiptap/core"

    // Import constants.
    import { fontSizes, headerLevels } from "$lib/shared/constants"

    // Import stores.
    import {
        fontNames, uIBackgroundColorStore,
        enableThingLinking, enableTextHyperlinking, 
    } from "$lib/stores"

    // Import utility functions.
    import { onMobile } from "$lib/shared/utility"

    // Import UI components.
    import CommandPalette from "$lib/widgets/layoutWidgets/commandPalette/commandPalette.svelte"



    export let editor: Editor
    export let fullSize: boolean
    export let focusEditorMethod: () => void
    export let isThingLinkMethod: () => boolean



    // HTML handles for toolbar elements.
    let colorPicker: HTMLInputElement


    // Set up reactive attributes for command palette width and font family, size, color, and
    // header level.
    let commandPaletteWidth: number = 1
    $: commandPaletteMaxRowLength = commandPaletteWidth / ((onMobile() ? 20 : 25) + 5) - 1
    let currentSelectionFontFamily: string | null
    $: if (editor) currentSelectionFontFamily = selectedFontFamily()
    let currentSelectionFontSize: number | null
    $: if (editor) currentSelectionFontSize = selectedFontSize()
    let currentSelectionColor: string
    $: if (editor) currentSelectionColor = selectedColor()
    let currentSelectionHeaderLevel: 1 | 2 | 3 | 4 | 5 | 6 | null
    $: if (editor) currentSelectionHeaderLevel = selectedHeaderLevel()


    // Get information about hotkey modifier keys.
    const onMac = /macOS|Macintosh|MacIntel|MacPPC|Mac68k/i.test(navigator.userAgent)
    const onChromeOs = /CrOS/i.test(navigator.userAgent)
	const nameForModKey = onMac ? "Cmd" : "Ctrl"

    // Construct the array of objects that define the command buttons.
    $: commandButtonInfos = [
        // Linking.
        {
            text: `Thing link (${nameForModKey}+L)`,
            iconName: "thing-link",
            iconHtml: null,
            isActive: (
                editor.isActive('link')
                && isThingLinkMethod()
            ),
            onClick: () => {
                if (editor.isActive('link') && isThingLinkMethod()) {
                    editor.chain().focus().unsetLink().run()
                } else {
                    enableThingLinking(editor, focusEditorMethod)
                }
            }
        },
        {
            text: `Hyperlink (${nameForModKey}+K)`,
            iconName: "link",
            iconHtml: null,
            isActive: (
                editor.isActive('link')
                && !isThingLinkMethod()
            ),
            onClick: () => {
                if (editor.isActive('link') && !isThingLinkMethod()) {
                    editor.chain().focus().unsetLink().run()
                } else {
                    enableTextHyperlinking(editor, focusEditorMethod)
                }
            }
        },

        // Basic formatting.
        {
            text: `Bold (${nameForModKey}+B)`,
            iconName: null,
            iconHtml: `<span style="font-weight: bold;">B</span>`,
            isActive: editor.isActive('bold'),
            onClick: () => editor.chain().focus().toggleBold().run()
        },
        {
            text: `Italic (${nameForModKey}+I)`,
            iconName: null,
            iconHtml: `<span style="font-style: italic;">I</span>`,
            isActive: editor.isActive('italic'),
            onClick: () => editor.chain().focus().toggleItalic().run()
        },
        {
            text: `Underline (${nameForModKey}+U)`,
            iconName: null,
            iconHtml: `<span style="text-decoration: underline;">U</span>`,
            isActive: editor.isActive('underline'),
            onClick: () => editor.chain().focus().toggleUnderline().run()
        },
        {
            text: `Strikethrough (${nameForModKey}+D)`,
            iconName: null,
            iconHtml: `<span style="text-decoration: line-through;">S</span>`,
            isActive: editor.isActive('strike'),
            onClick: () => editor.chain().focus().toggleStrike().run()
        },

        // Text alignment.
        {
            text: "Align to left",
            iconName: "left-align",
            iconHtml: null,
            isActive: editor.isActive({ textAlign: 'left' }),
            onClick: () => editor.chain().focus().setTextAlign('left').run()
        },
        {
            text: "Align to center",
            iconName: "center-align",
            iconHtml: null,
            isActive: editor.isActive({ textAlign: 'center' }),
            onClick: () => editor.chain().focus().setTextAlign('center').run()
        },
        {
            text: "Align to right",
            iconName: "right-align",
            iconHtml: null,
            isActive: editor.isActive({ textAlign: 'right' }),
            onClick: () => editor.chain().focus().setTextAlign('right').run()
        },
        {
            text: "Justify text",
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
            text: `Undo (${nameForModKey}+Z)`,
            iconName: "undo",
            iconHtml: null,
            isActive: false,
            onClick: () => editor.chain().focus().undo().run()
        },
        {
            text: `Redo (${
                onMac || onChromeOs ? "Shift+" :
                ""
            }${
                nameForModKey
            }+${
                onMac || onChromeOs ? "Z" :
                "Y"
            })`,
            iconName: "redo",
            iconHtml: null,
            isActive: false,
            onClick: () => editor.chain().focus().redo().run()
        },
        {
            text: `Un-format (${nameForModKey}+Spc)`,
            iconName: "clean",
            iconHtml: null,
            isActive: false,
            onClick: () => {
                editor.chain().focus().unsetAllMarks().run()
                editor.chain().focus().clearNodes().run()
            }
        }
    ]


    /**
     * Selected-font-family method.
     * 
     * Gets the font family of the currently-selected text.
     */
    function selectedFontFamily(): string | null {
        return editor.getAttributes("textStyle").fontFamily || null
    }
    
    /**
     * Selected-font-size method.
     * 
     * Gets the font size of the currently-selected text.
     */
    function selectedFontSize(): number | null {
        let selectedFontSize = editor.getAttributes("textStyle").fontSize || null
        if (typeof selectedFontSize === "string") {
            selectedFontSize = Number(selectedFontSize.replace("pt", ""))
        }
        return selectedFontSize
    }

    /**
     * Selected-text-color method.
     * 
     * Gets the color of the currently-selected text.
     */
    function selectedColor(): string {
        let selectedColor = editor.getAttributes("textStyle").color || null
        return selectedColor
    }

    /**
     * Selected-text-header-level method.
     * 
     * Gets the header level of the currently-selected text.
     */
    function selectedHeaderLevel(): 1 | 2 | 3 | 4 | 5 | 6 | null {
        let selectedHeaderLevel = editor.getAttributes("heading").level || null
        return selectedHeaderLevel
    }
</script>


{#if editor}
    <!-- Notes toolbar. -->
    <div
        class="notes-toolbar"
        class:on-mobile={onMobile()}

        style="
            {onMobile() && fullSize ? "margin-left: 26px;" : ""}
            background-color: {$uIBackgroundColorStore};
        "
    >
        <!-- Font family, size, and header level selectors. -->
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

                value={
                    editor.isActive('blockquote') ? "Blockquote" :
                    editor.isActive('codeBlock') ? "Code block" :
                    currentSelectionHeaderLevel === null ? "Body" :
                    `H${currentSelectionHeaderLevel}`
                }
            >
                {#each headerLevels as headerLevel}
                    <option
                        value={headerLevel === null ? "Body" : `H${headerLevel}`}
                        on:click={() => {
                            editor.chain().focus().unsetAllMarks().run()
                            editor.chain().focus().clearNodes().run()
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

                <option
                    value="Blockquote"
                    on:click={() => {
                        editor.chain().focus().unsetAllMarks().run()
                        editor.chain().focus().clearNodes().run()
                        editor.chain().focus().toggleBlockquote().run()
                    } }
                >
                    Blockquote
                </option>

                <option
                    value="Code block"
                    on:click={() => {
                        editor.chain().focus().unsetAllMarks().run()
                        editor.chain().focus().clearNodes().run()
                        editor.chain().focus().toggleCodeBlock().run()
                    } }
                >
                    Code block
                </option>
            </select>

            <input
                class="color-picker"
                type="color"
                bind:this={colorPicker}
                value={currentSelectionColor === null ? "#000000" : currentSelectionColor}

                on:change={ () => editor.chain().focus().setColor(colorPicker.value).run() }
            >
        </div>

        <!-- Command palette containing the rest of the controls. -->
        <div bind:clientWidth={commandPaletteWidth}>
            <CommandPalette
                {commandButtonInfos}
                buttonSize={onMobile() ? 20 : 25}
                maxRowLength={commandPaletteMaxRowLength}
                startPadding={onMobile() ? 8 : 10}
                showText={onMobile() ? false : true}
                separateRowForText={false}
                textSide={"right"}
                showBorder={false}
            />
        </div>

        <!-- Empty space for the edit button. -->
        <div
            class="edit-button-spacer"

            style={
                onMobile() ? "width: 45px; flex: 0 0 45px" :
                "width: 55px; flex: 0 0 55px"
            }
        />
    </div>
{/if}


<style>
    .notes-toolbar {
        flex: 0 0;

        border-radius: 5px;

        position: relative;

        display: flex;
        flex-direction: row;
        padding: 0;
        gap: 0.25rem;
    }

    .notes-toolbar.on-mobile {
        padding: 0.1rem;
        gap: 0.05rem;
    }

    .button-group {
        position: absolute;
        left: 5px;
        top: 5px;
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
        border-radius: 3px;
        border: solid 1px lightgrey;

        height: 25px;
        background-color: white;

        font-size: 0.73rem;
    }

    select:hover, input:hover {
        border: solid 1px black;
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

    .edit-button-spacer {
        height: 100%;

        align-items: center;
    }
</style>