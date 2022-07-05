import type { Editor } from "@tiptap/core"


export interface ThingLinkingInfo{
    editor: Editor | null,
    focusEditorMethod: ( () => void ) | null,
    url: string | null
}

export const nullThingLinkingInfo: ThingLinkingInfo = {
    editor: null,
    focusEditorMethod: null,
    url: null
}