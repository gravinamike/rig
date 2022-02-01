import type { ThingWidgetModel } from "./thingWidgetModel"
import type { Graph } from "$lib/models/graphModels"


export type ThingAddress = {
    graph: Graph;
    generationId: number,
    parentThingWidgetModel: ThingWidgetModel | null,
    halfAxisId: number | null,
    indexInCohort: number
}