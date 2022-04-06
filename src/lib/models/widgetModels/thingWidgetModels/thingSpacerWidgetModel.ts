import type { Graph } from "$lib/models/graphModels"
import { ThingBaseWidgetModel } from "."


export class ThingSpacerWidgetModel extends ThingBaseWidgetModel {
    kind = "thingSpacerWidgetModel" as const

    constructor(thingId: number, graph: Graph) {
        super(thingId, graph)
    }
}