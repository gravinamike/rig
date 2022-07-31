import type { RelationshipCohortWidgetModel } from "$lib/models/widgetModels"


export interface ReorderingInfo{
    sourceWidgetModel: RelationshipCohortWidgetModel | null,
    destThingId: number | null
    destThingIndex: number | null
    trackingMouse: boolean
}

export const nullReorderingInfo: ReorderingInfo = {
    sourceWidgetModel: null,
    destThingId: null,
    destThingIndex: null,
    trackingMouse: false
}