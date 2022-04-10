export interface CommandButtonInfo {
    text: string,
    iconName: string | null,
    iconHtml: string | null,
    isActive: boolean,
    onClick: () => void
}

// This interface and null exemplar are for use when the command palette is used as
// a context menu in the application's front menu pane.
export interface ContextCommandPaletteInfo {
    show: boolean,
    position: [number, number],
    buttonInfos: CommandButtonInfo[]
}

export const nullContextCommandPaletteInfo: ContextCommandPaletteInfo = {
    show: false,
    position: [0, 0],
    buttonInfos: []
}