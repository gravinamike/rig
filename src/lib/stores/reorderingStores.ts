// Import types.
import type { RelationshipReorderingInfo } from "./types"
import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"
import type { ThingCohort } from "$lib/models/constructModels"

// Import basic framework resources.
import { writable } from "svelte/store"

// Import null values for stores.
import { nullRelationshipReorderingInfo } from "./types"



/**
 * Reordering info store.
 * Contains the info necessary to reorder Relationships.
 */
export const reorderingInfoStore = writable(
    {
        dragStartPosition: null,
        reorderInProgress: false,

        graphWidgetStyle: null,
        thingCohort: null,
        destThingId: null,

        startIndex: null,
        newIndex: null
        
    } as RelationshipReorderingInfo
)

/**
 * Set-reordering-drag-start-position method.
 * 
 * Sets the start position for a reordering drag operation.
 * @param dragStartPosition - An x/y coordinate array specifying the start position, or null.
 */
export function setReorderingDragStart(
    dragStartPosition: [number, number] | null,
    graphWidgetStyle: GraphWidgetStyle,
    thingCohort: ThingCohort,
    destThingId: number
): void {
    reorderingInfoStore.update( current => {
        current.dragStartPosition = dragStartPosition
        current.graphWidgetStyle = graphWidgetStyle
        current.thingCohort = thingCohort
        current.destThingId = destThingId
        return current
    } )
}

/**
 * Enable-reordering method.
 * 
 * Sets starting info for a Relationship-reordering operation.
 * @param dragStartPosition - An x/y coordinate array specifying the start position, or null.
 * @param thingCohort - The Thing Cohort associated with the Relationships that are being reordered.
 * @param destThingStartIndex - The starting index of the Relationship that is being moved.
 * @param destThingId - The ID of the destination Thing of the Relationship that is being moved.
 */
export function enableReordering(
    dragStartPosition: [number, number], graphWidgetStyle: GraphWidgetStyle, thingCohort: ThingCohort,
    destThingStartIndex: number, destThingId: number
): void {
    reorderingInfoStore.set(
        {
            dragStartPosition: dragStartPosition,
            reorderInProgress: true,

            graphWidgetStyle: graphWidgetStyle,
            thingCohort: thingCohort,
            destThingId: destThingId,

            startIndex: destThingStartIndex,
            newIndex: null
        }
    )
}

/**
 * Set-reordering-index method.
 * 
 * Sets the new index of the Relationship that is being moved in a reordering operation.
 * @param newIndex - The new index, or null.
 */
export function setReorderingIndex(newIndex: number | null): void {
    reorderingInfoStore.update( current => {
        current.newIndex = newIndex
        return current
    } )
}

/**
 * Disable-reordering method.
 * 
 * Sets Relationship-reordering store to its null starting values.
 */
export function disableReordering(): void {
    reorderingInfoStore.update( () => { return {...nullRelationshipReorderingInfo} } )
}