import type { Direction, Graph } from "$lib/models/constructModels"
import type { HalfAxisId } from "$lib/shared/constants"
import type { GraphWidgetStyle } from "../../graph"


export interface RelationshipBeingCreatedInfo {
    graph: Graph | null,
    graphWidgetStyle: GraphWidgetStyle | null,

    sourceThingId: number | null,
    sourceThingOpacity: number | null,
    sourceHalfAxisId: HalfAxisId | null,
    sourceDirection: Direction | null,

    startPosition: [number, number],
    endPosition: [number, number],
    trackingMouse: boolean,

    destThingId: number | null,
    destHalfAxisId: HalfAxisId | null,
    destDirection: Direction | null,

    selectedDirection: Direction | null
}

export const nullRelationshipBeingCreatedInfo: RelationshipBeingCreatedInfo = {
    graph: null,
    graphWidgetStyle: null,

    sourceThingId: null,
    sourceThingOpacity: null,
    sourceHalfAxisId: null,
    sourceDirection: null,

    startPosition: [0, 0],
    endPosition: [0, 0],
    trackingMouse: false,

    destThingId: null,
    destHalfAxisId: null,
    destDirection: null,

    selectedDirection: null
}