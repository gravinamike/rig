import { halfAxisOppositeIds, offsetsByHalfAxisId } from "$lib/shared/constants"
import type { Graph, Cohort } from "$lib/models/graphModels"


export class CohortWidgetModel {
    kind = "cohortWidgetModel"

    cohort: Cohort
    graph: Graph

    constructor(cohort: Cohort, graph: Graph) {
        this.cohort = cohort
        this.graph = graph

        
    }

    get planeId(): number {
        return this.cohort.plane?.id || 0
    }

    get xYOffsets(): { x: number, y: number } {
        const offsetSigns = offsetsByHalfAxisId[this.cohort.address.halfAxisId]
        return [7, 8].includes(this.cohort.address.halfAxisId) ?
            { x: 0, y: 0 } :
            {
                x: this.graph.graphWidgetStyle.relationDistance * offsetSigns[0]
                    + this.graph.planeOffsets[0] * this.planeId,
                y: this.graph.graphWidgetStyle.relationDistance * offsetSigns[1]
                    + this.graph.planeOffsets[1] * this.planeId
            }
    }

    get zIndex(): number {
        const offsetSigns = offsetsByHalfAxisId[this.cohort.address.halfAxisId]
        return 2 * this.cohort.address.generationId * offsetSigns[2]

    }

    get rowOrColumn(): "row" | "column" {
        return [3, 4, 5, 6, 7, 8].includes(this.cohort.address.halfAxisId) ?
            "column" :
            "row"
    }

    get grandparentThingId(): number | null {
        return this.cohort.parentCohort()?.address.parentThingWidgetModel?.thingId || null
    }

    // If the Cohort contains its own doubled-back grandparent Thing, get the index of that Thing in the Cohort.
    ////////////////////////////////////////////////////// MOVE THIS TO COHORT ITSELF INSTEAD OF WIDGET MODEL?
    get indexOfGrandparentThing(): number | null {
        return this.grandparentThingId !== null ? 
            this.cohort.members.findIndex( member => member.thingId === this.grandparentThingId )
            : null
    }

    get offsetToGrandparentThing(): number {
        const parentThingOffset = (
                this.cohort.matchedRelationshipsWidgetModel
                && this.cohort.address.halfAxisId
                && this.cohort.address.parentThingWidgetModel
                && this.cohort.matchedRelationshipsWidgetModel.parentRelationshipsWidgetModel
                && this.cohort.matchedRelationshipsWidgetModel.parentRelationshipsWidgetModel.halfAxisId === halfAxisOppositeIds[this.cohort.address.halfAxisId]
            ) ?
                // The midline of the parent Thing.
                this.cohort.matchedRelationshipsWidgetModel.defaultLeafMidline(this.cohort.address.parentThingWidgetModel.address.indexInCohort)
                // Half of the gap between Things.
                + this.graph.graphWidgetStyle.betweenThingGap / 2 :
                0

        const thisThingOffset = this.indexOfGrandparentThing !== null && this.indexOfGrandparentThing !== -1 ?
            // The difference between the halfway index of the Cohort and the index of the grandparent Thing.
            ((this.cohort.members.length - 1) / 2 - this.indexOfGrandparentThing)
            // The combined width of 1 Thing and 1 gap between Things.
            * (this.graph.graphWidgetStyle.thingSize + this.graph.graphWidgetStyle.betweenThingGap) :
            0

        const offsetToGrandparentThing = parentThingOffset + thisThingOffset

        return offsetToGrandparentThing
    } ////////////////////////////// REFACTOR THIS METHOD.
    

    get offsetToGrandparentThingX(): number {
        return this.rowOrColumn === "row" ?
            this.offsetToGrandparentThing :
            0
    }

    get offsetToGrandparentThingY(): number {
        return this.rowOrColumn === "column" ?
            this.offsetToGrandparentThing :
            0
    }
}