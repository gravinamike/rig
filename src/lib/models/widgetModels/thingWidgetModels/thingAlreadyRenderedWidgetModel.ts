import type { Graph } from "$lib/models/graphModels"
import { ThingBaseWidgetModel } from "."


export class ThingAlreadyRenderedWidgetModel extends ThingBaseWidgetModel {
    kind = "thingAlreadyRenderedWidgetModel" as const

    constructor(thingId: number, graph: Graph) {
        super(thingId, graph)
    }
}