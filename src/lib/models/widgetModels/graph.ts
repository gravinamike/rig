import type { GraphWidgetStyle } from "$lib/shared/constants"
import type { Graph } from "$lib/models/graphModels"
import { defaultGraphWidgetStyle } from "$lib/shared/constants"
import { ThingCohortWidgetModel } from "$lib/models/widgetModels"


/* Model specifying a Graph Widget. */
export class GraphWidgetModel {
    kind = "graphWidgetModel"

    graph: Graph

    rootThingCohortWidgetModel: ThingCohortWidgetModel | null = null
    style: GraphWidgetStyle = {...defaultGraphWidgetStyle}
    thingIdToScrollTo: number | null = null
    allowScrollToThingId = false
    allowZoomAndScrollToFit = false
    formActive = false

    /**
     * Create a Graph Widget Model.
     * @param {Graph} graph - The Graph that the widget is based on.
     */
    constructor(graph: Graph) {
        this.graph = graph

        // Configure model for off-axis styling, if applicable.
        if (graph.offAxis) {
            this.style.excludePerspectiveThing = true
            this.style.excludeCartesianAxes = true
        }

        // Build the model.
        this.build()
    }

    /**
     * Build the model.
     */
    async build(): Promise< void > {
        // Set model attributes to initial configuration.
        this.formActive = false

        // Assign a root Thing Cohort Widget Model, based on the Graph's root Thing Cohort.
        if (this.graph.rootCohort) {
            this.rootThingCohortWidgetModel = new ThingCohortWidgetModel(this.graph.rootCohort, this)
            await this.rootThingCohortWidgetModel.build()
        }
    }

    /**
     * Get the IDs of all of the Things already added to the Graph Widget Model.
     * @return {number[]} - An array of Thing IDs already added to the Graph Widget Model.
     */
    get thingIdsAlreadyInModel(): number[] {
        const thingIdsAlreadyInModel = this.rootThingCohortWidgetModel?.thingIdsInModel || []
        return thingIdsAlreadyInModel
    }
}