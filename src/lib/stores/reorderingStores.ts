import type { ReorderingInfo } from "./types"

import { writable } from "svelte/store"
import { nullReorderingInfo } from "./types"


export const reorderingInfoStore = writable(
    {
        sourceThingId: null,
        destThingId: null,
        destThingIndex: null,
        trackingMouse: true
    } as ReorderingInfo
)

export function enableReordering(sourceThingId: number): void {
    reorderingInfoStore.set(
        {
            sourceThingId: sourceThingId,
            destThingId: null,
            destThingIndex: null,
            trackingMouse: true
        }
    )
}

export function setReorderingDestInfo(destThingId: number, destThingIndex: number | null): void {
    reorderingInfoStore.update( current => {
        current.destThingId = destThingId
        current.destThingIndex = destThingIndex
        return current
    } )
    console.log(destThingIndex)
    //disableReordering()
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
    reorderingInfoStore.update( () => nullReorderingInfo )
}