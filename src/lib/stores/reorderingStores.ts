import type { ReorderingInfo } from "./types"

import { writable } from "svelte/store"
import { nullReorderingInfo } from "./types"


export const reorderingInfoStore = writable(
    {
        sourceThingId: null,
        destThingDirectionId: null,
        destThingId: null,
        newIndex: null,
        trackingMouse: false
    } as ReorderingInfo
)

export function enableReordering(
    sourceThingId: number, destThingDirectionId: number, destThingId: number
): void {
    reorderingInfoStore.set(
        {
            sourceThingId: sourceThingId,
            destThingDirectionId: destThingDirectionId,
            destThingId: destThingId,
            newIndex: null,
            trackingMouse: true
        }
    )
}

export function setReorderingIndex(newIndex: number | null): void {
    reorderingInfoStore.update( current => {
        current.newIndex = newIndex

        return current
    } )
}

export function setReorderingTrackingMouse(trackingMouse: boolean): void {
    reorderingInfoStore.update( current => {
        current.trackingMouse = trackingMouse
        return current
    } )
}

/**
 * Disable the Relationship-reordering operation.
 */
export function disableReordering(): void {
    reorderingInfoStore.update( () => {return {...nullReorderingInfo}} )
}