import { writable } from "svelte/store"
import { saveGraphConfig } from "$lib/shared/config"
import { removeItemFromArray } from "$lib/shared/utility"


// Pin IDs Store.
// Holds the IDs of the Pinned Things.
export const pinIdsStore = writable( [] as number[] )

/**
 * Add a Pin by ID if it doesn't already exist.
 * @param  {number} thingId - The ID of the Thing to Pin.
 */
export async function addPin( thingId: number ): Promise<void> {
    // Add the Pin to the store.
    pinIdsStore.update(
        (current) => {
            if ( !current.includes(thingId) ) current.push(thingId)
            return current
        }
    )

    // Update the Graph config to reflect the change.
    await saveGraphConfig()
}

/**
 * Remove a Pin by ID if it exists.
 * @param  {number} thingId - The ID of the Thing to un-Pin.
 */
export async function removePin( thingId: number ): Promise<void> {
    // Remove the Pin from the store.
    pinIdsStore.update(
        (current) => {
            removeItemFromArray(current, thingId)
            return current
        }
    )

    // Update the Graph config to reflect the change.
    await saveGraphConfig()
}