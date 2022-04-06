import type { Graph } from "$lib/models/graphModels"
import { ThingBaseWidgetModel } from "./"


export class ThingPlaceholderWidgetModel extends ThingBaseWidgetModel {
    kind = "thingPlaceholderWidgetModel" as const

    constructor(thingId: number, graph: Graph) {
        super(thingId, graph)
    }
}