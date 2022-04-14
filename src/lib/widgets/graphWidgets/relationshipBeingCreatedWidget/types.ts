import type { ThingWidgetModel, RelationshipsWidgetModel } from "$lib/models/widgetModels"


export interface RelationshipBeingCreatedInfo{
    sourceWidgetModel: ThingWidgetModel | RelationshipsWidgetModel | null,
    startPosition: [number, number],
    endPosition: [number, number],
}

export const nullRelationshipBeingCreatedInfo: RelationshipBeingCreatedInfo = {
    sourceWidgetModel: null,
    startPosition: [0, 0],
    endPosition: [0, 0]
}