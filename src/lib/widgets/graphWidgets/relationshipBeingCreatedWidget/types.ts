import type { DirectionDbModel } from "$lib/models/dbModels"
import type { ThingWidgetModel, RelationshipsWidgetModel } from "$lib/models/widgetModels"


export interface RelationshipBeingCreatedInfo{
    sourceWidgetModel: ThingWidgetModel | RelationshipsWidgetModel | null,
    destWidgetModel: ThingWidgetModel | RelationshipsWidgetModel | null,
    startPosition: [number, number],
    endPosition: [number, number],
    trackingMouse: boolean,
    selectedDirection: DirectionDbModel | null
}

export const nullRelationshipBeingCreatedInfo: RelationshipBeingCreatedInfo = {
    sourceWidgetModel: null,
    destWidgetModel: null,
    startPosition: [0, 0],
    endPosition: [0, 0],
    trackingMouse: false,
    selectedDirection: null
}