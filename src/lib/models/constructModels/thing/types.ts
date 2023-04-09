import type { GraphConstruct } from "$lib/shared/constants"
import type { Graph, Thing } from "$lib/models/constructModels"


/**
 * Thing address.
 * 
 * Type for an object that specifies a Thing's unique position in its Graph.
 */
export type ThingAddress = {
    graph: Graph;
    generationId: number,
    parentThingId: number | null,
    halfAxisId: number | null,
    indexInCohort: number
}

/**
 * Relationship info.
 * 
 * Interface for an object that specifies the information a Thing retains
 * about one of its Relationships.
 */
export interface RelationshipInfo {
    relatedThingId: number | null,
    directionId: number,
    order: number | null
}

/*
 * Typeguard function for Thing construct class.
 */
export function isThing(construct: GraphConstruct): construct is Thing {
    return "note" in construct
}