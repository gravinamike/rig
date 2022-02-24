import type { CommandButtonInfo, ContextCommandPaletteInfo } from "$lib/widgets/layoutWidgets/commandPalette"
import { writable } from "svelte/store"
import { saveConfig } from "$lib/shared/config"
import { nullContextCommandPaletteInfo } from "$lib/widgets/layoutWidgets/commandPalette"


// Create navigation-related stores.
export const pinIdsStore = writable( [] as number[] )

// Create UI-related stores.
export const commandPaletteInfoStore = writable(
    {
        show: false,
        position: [0, 0],
        buttonInfos: []
    } as ContextCommandPaletteInfo
)

export const hoveredThingIdStore = writable( null as number | null )


/**
 * Add a Pin by ID if it doesn't already exist.
 */
export async function addPin(thingId: number): Promise<void> {
    pinIdsStore.update( (current) => { if (!current.includes(thingId)) current.push(thingId); return current } )
    await saveConfig()
}

/**
 * Remove a Pin by ID if it exists.
 */
export async function removePin(thingId: number): Promise<void> {
    pinIdsStore.update( (current) => {
        const index = current.indexOf(thingId)
        if (index !== -1) current.splice(index, 1)
        return current
    } )
    await saveConfig()
}


/**
 * Open a context command palette.
 */
 export function openContextCommandPalette(position: [number, number], buttonInfos: CommandButtonInfo[]): void {
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