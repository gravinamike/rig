import { writable } from "svelte/store"
import { saveConfig } from "$lib/shared/config"


// Create navigation-related Stores.
export const pinIdsStore = writable( [] as number[] )

// Create UI-related stores.
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