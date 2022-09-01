import type { GraphWidgetModel } from "../graph"
import type { ThingCohortWidgetModel } from "$lib/models/widgetModels"
import { ThingBaseWidgetModel } from "."


export class ThingAlreadyRenderedWidgetModel extends ThingBaseWidgetModel {
    kind = "thingAlreadyRenderedWidgetModel" as const

    constructor(thingId: number, graphWidgetModel: GraphWidgetModel, parentThingCohortWidgetModel: ThingCohortWidgetModel) {
        super(thingId, graphWidgetModel, parentThingCohortWidgetModel)
    }
}