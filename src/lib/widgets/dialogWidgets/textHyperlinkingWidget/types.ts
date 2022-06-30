import type { Editor } from "@tiptap/core"


export interface TextHyperlinkingInfo{
    editor: Editor | null,
    focusEditorMethod: ( () => void ) | null,
    url: string | null
}

export const nullTextHyperlinkingInfo: TextHyperlinkingInfo = {
    editor: null,
    focusEditorMethod: null,
    url: null
}