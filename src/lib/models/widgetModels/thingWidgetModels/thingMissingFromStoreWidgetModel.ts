import type { Graph } from "$lib/models/graphModels"
import { ThingBaseWidgetModel } from "./"


export class ThingMissingFromStoreWidgetModel extends ThingBaseWidgetModel {
    kind = "thingMissingFromStoreWidgetModel" as const

    constructor(thingId: number, graph: Graph) {
        super(thingId, graph)
    }
}