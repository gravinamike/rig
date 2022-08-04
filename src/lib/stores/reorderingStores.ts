import type { ReorderingInfo } from "$lib/widgets/graphWidgets"

import { writable } from "svelte/store"
import { nullReorderingInfo } from "$lib/widgets/graphWidgets"


export const reorderingInfoStore = writable(
    {
        sourceThingId: null,
        destThingDirectionId: null,
        destThingId: null,
        newIndex: null,
        trackingMouse: true
    } as ReorderingInfo
)

/**
 * Enable the Relationship-reordering operation.
 */
export function enableReordering(sourceThingId: number, destThingDirectionId: number, destThingId: number): void {
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
    reorderingInfoStore.update( () => nullReorderingInfo )
}