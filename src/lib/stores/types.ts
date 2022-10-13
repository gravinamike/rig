import type { ThingCohort } from "$lib/models/constructModels"

/**
 * Information needed to reorder Relationships.
 */
export interface RelationshipReorderingInfo {
    dragStartPosition: [number, number] | null
    reorderInProgress: boolean

    thingCohort: ThingCohort | null
    destThingId: number | null

    startIndex: number | null
    newIndex: number | null
}

/**
 * The null (starting) values for information needed to reorder Relationships.
 */
export const nullRelationshipReorderingInfo: RelationshipReorderingInfo = {
    dragStartPosition: null,
    reorderInProgress: false,

    thingCohort: null,
    destThingId: null,

    startIndex: null,
    newIndex: null
    
}