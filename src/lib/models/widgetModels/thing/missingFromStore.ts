import type { GraphWidgetModel } from "../graph"
import type { ThingCohortWidgetModel } from "$lib/models/widgetModels"
import { ThingBaseWidgetModel } from "."


export class ThingMissingFromStoreWidgetModel extends ThingBaseWidgetModel {
    kind = "thingMissingFromStoreWidgetModel" as const

    constructor(thingId: number | null, graphWidgetModel: GraphWidgetModel, parentThingCohortWidgetModel: ThingCohortWidgetModel) {
        super(thingId, graphWidgetModel, parentThingCohortWidgetModel)
    }
}