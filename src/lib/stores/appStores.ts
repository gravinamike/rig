/* Type imports. */
import type { CommandButtonInfo, ContextCommandPaletteInfo } from "$lib/widgets/layoutWidgets/commandPalette"

/* Framework-related imports. */
import { writable } from "svelte/store"

/* Config-related imports. */
//import { saveGraphConfig } from "$lib/shared/config"

/* Widget-related imports. */
import { nullContextCommandPaletteInfo } from "$lib/widgets/layoutWidgets/commandPalette"


/* Create stores */


export const unigraphFolderStore = writable( null as string | null )


// Create UI-related stores.
export const commandPaletteInfoStore = writable(
    {
        show: false,
        position: [0, 0],
        buttonInfos: []
    } as ContextCommandPaletteInfo
)

export const hoveredThingIdStore = writable( null as number | null )

// Create navigation-related stores.
export const pinIdsStore = writable( [] as number[] )


/* UI-related functions. */

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


/* Navigation-related functions. */

/**
 * Add a Pin by ID if it doesn't already exist.
 */
 export async function addPin(thingId: number): Promise<void> {
    pinIdsStore.update( (current) => { if (!current.includes(thingId)) current.push(thingId); return current } )
    await saveGraphConfig()
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
    await saveGraphConfig()
}



export const loadingState = writable(
    "start" as (
        "start" | "configLoading" | "configLoaded" | "graphLoading" | "graphLoaded" | "error"
    )
)