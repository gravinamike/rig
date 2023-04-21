// Import basic framework resources.
import { writable } from "svelte/store"

// Import utility functions.
import { removeItemFromArray } from "$lib/shared/utility"



/**
 * Direction-editing-in-progress store.
 * Specifies whether a Direction-editing process is underway.
 */
export const directionEditingInProgressIdStore = writable(new Set() as Set<number>)

/**
 * Add-Direction-ID-to-editing-in-progress-store method.
 * 
 * Adds a Direction ID to the Direction-editing-in-progress store.
 * @param id - The ID of the Direction to add.
 */
export function addDirectionIdToEditingInProgressStore(id: number) {
    directionEditingInProgressIdStore.update(
        current => {current.add(id as number); return current}
    )
}

/**
 * Remove-Direction-ID-from-editing-in-progress-store method.
 * 
 * Removes a Direction ID from the Direction-editing-in-progress store.
 * @param id - The ID of the Direction to remove.
 */
export function removeDirectionIdFromEditingInProgressStore(id: number) {
    directionEditingInProgressIdStore.update(
        current => {current.delete(id); return current}
    )
}

/**
 * Space-editing-in-progress store.
 * Specifies whether a Space-editing process is underway.
 */
export const spaceEditingInProgressIdStore = writable(new Set() as Set<number>)

/**
 * Add-Space-ID-to-editing-in-progress-store method.
 * 
 * Adds a Space ID to the Space-editing-in-progress store.
 * @param id - The ID of the Space to add.
 */
export function addSpaceIdToEditingInProgressStore(id: number) {
    spaceEditingInProgressIdStore.update(
        current => {current.add(id as number); return current}
    )
}

/**
 * Remove-Space-ID-from-editing-in-progress-store method.
 * 
 * Removes a Space ID from the Space-editing-in-progress store.
 * @param id - The ID of the Space to remove.
 */
export function removeSpaceIdFromEditingInProgressStore(id: number) {
    spaceEditingInProgressIdStore.update(
        current => {current.delete(id); return current}
    )
}