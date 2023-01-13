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

export async function setPins( thingIds: number[] ): Promise<void> {
    pinIdsStore.set(thingIds)

    // Update the Graph config to reflect the change.
    await saveGraphConfig()
}








// Home Thing ID Store.
// Holds the IDs of the Home Thing (or null if none).
export const homeThingIdStore = writable( null as number | null )

/**
 * Set the ID of the Home Thing.
 * @param  {number} thingId - The ID of the new Home Thing.
 */
export async function setHomeThingId( thingId: number ): Promise<void> {
    // Set the Home Thing ID.
    homeThingIdStore.set( thingId )
    console.log(thingId)
    // Update the Graph config to reflect the change.
    await saveGraphConfig()
}

/**
 * Set the Home Thing ID to null (meaning no Home Thing).
 */
export async function removeHomeThing(): Promise<void> {
    // Set the Home Thing ID to null.
    homeThingIdStore.set( null )

    // Update the Graph config to reflect the change.
    await saveGraphConfig()
}