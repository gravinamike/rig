import type { GraphWidgetStyle } from "$lib/shared/constants"
import type { Graph, Cohort } from "$lib/models/graphModels"
import { defaultGraphWidgetStyle } from "$lib/shared/constants"
import { ThingCohortWidgetModel } from "$lib/models/widgetModels"


export class GraphWidgetModel {
    kind = "graphWidgetModel"

    graph: Graph

    rootThingCohortWidgetModel: ThingCohortWidgetModel | null = null
    graphWidgetStyle: GraphWidgetStyle = {...defaultGraphWidgetStyle}
    thingIdToScrollTo: number | null = null
    allowScrollToThingId = false
    allowZoomAndScrollToFit = false
    formActive = false

    constructor(graph: Graph) {
        this.graph = graph

        if (graph.offAxis) {
            this.graphWidgetStyle.excludePerspectiveThing = true
            this.graphWidgetStyle.excludeCartesianAxes = true
        }

        this.build()
    }

    async build(): Promise< void > {
        this.rootThingCohortWidgetModel = new ThingCohortWidgetModel(this.graph.rootCohort as Cohort, this, null)
        this.formActive = false
    }
}