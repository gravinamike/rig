import type { ThingWidgetModel, RelationshipCohortWidgetModel } from "$lib/models/widgetModels"


export interface RemoteRelatingInfo{
    sourceWidgetModel: ThingWidgetModel | RelationshipCohortWidgetModel | null
}

export const nullRemoteRelatingInfo: RemoteRelatingInfo = {
    sourceWidgetModel: null
}