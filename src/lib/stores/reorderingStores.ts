import type { RelationshipCohortWidgetModel } from "$lib/models/widgetModels"
import type { ReorderingInfo } from "$lib/widgets/graphWidgets"

import { writable } from "svelte/store"
import { nullReorderingInfo } from "$lib/widgets/graphWidgets"


export const reorderingInfoStore = writable(
    {
        sourceWidgetModel: null,
        destThingId: null,
        destThingIndex: null,
        trackingMouse: true
    } as ReorderingInfo
)

/**
 * Enable the Relationship-reordering operation.
 */
export function enableReordering(sourceWidgetModel: RelationshipCohortWidgetModel): void {
    reorderingInfoStore.set(
        {
            sourceWidgetModel: sourceWidgetModel,
            destThingId: null,
            destThingIndex: null,
            trackingMouse: true
        }
    )
}

/*export function updateRelationshipBeingCreatedEndpoint(position: [number, number]): void {
    relationshipBeingCreatedInfoStore.update( current => {
        current.endPosition = current.trackingMouse ? position : current.endPosition
        return current
    } )
}*/

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