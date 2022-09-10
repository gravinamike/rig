import type { Direction } from "$lib/models/constructModels"
import type { ThingWidgetModel, RelationshipCohortWidgetModel } from "$lib/models/widgetModels"


export interface RelationshipBeingCreatedInfo{
    sourceWidgetModel: ThingWidgetModel | RelationshipCohortWidgetModel | null,
    destWidgetModel: ThingWidgetModel | RelationshipCohortWidgetModel | null,
    startPosition: [number, number],
    endPosition: [number, number],
    trackingMouse: boolean,
    selectedDirection: Direction | null
}

export const nullRelationshipBeingCreatedInfo: RelationshipBeingCreatedInfo = {
    sourceWidgetModel: null,
    destWidgetModel: null,
    startPosition: [0, 0],
    endPosition: [0, 0],
    trackingMouse: false,
    selectedDirection: null
}