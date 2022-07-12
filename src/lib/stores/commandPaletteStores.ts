import type { CommandButtonInfo, ContextCommandPaletteInfo } from "$lib/widgets/layoutWidgets/commandPalette"

import { writable } from "svelte/store"
import { nullContextCommandPaletteInfo } from "$lib/widgets/layoutWidgets/commandPalette"


// Command Palette Info Store.
// Controls the Context Command Palette.
export const commandPaletteInfoStore = writable(
    {
        show: false,
        position: [0, 0],
        buttonInfos: []
    } as ContextCommandPaletteInfo
)

/**
 * Open a context command palette.
 * @param  {[number, number]} position - The screen coordinates at which to open the palette.
 * @param  {CommandButtonInfo[]} buttonInfos - Array of settings for each button in the palette.
 */
export function openContextCommandPalette(
    position: [number, number],
    buttonInfos: CommandButtonInfo[]
): void {
    const contextCommandPaletteInfo = {
        show: true,
        position: position,
        buttonInfos: buttonInfos
    }
    commandPaletteInfoStore.update( () => contextCommandPaletteInfo )
}

/**
 * Close the context command palette.
 */
 export function closeContextCommandPalette(): void {
    commandPaletteInfoStore.update( () => nullContextCommandPaletteInfo )
}