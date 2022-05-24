import { halfAxisOppositeIds, offsetsByHalfAxisId } from "$lib/shared/constants"
import type { Graph, Cohort } from "$lib/models/graphModels"


export class ThingCohortWidgetModel {
    kind = "thingCohortWidgetModel"

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
        if (!this.cohort.halfAxisId) return { x: 0, y: 0 }
        const offsetSigns = offsetsByHalfAxisId[this.cohort.halfAxisId]
        return [7, 8].includes(this.cohort.halfAxisId) ?
            { x: 0, y: 0 } :
            {
                x: this.graph.graphWidgetStyle.relationDistance * offsetSigns[0]
                    + this.graph.planes.offsets[0] * this.planeId,
                y: this.graph.graphWidgetStyle.relationDistance * offsetSigns[1]
                    + this.graph.planes.offsets[1] * this.planeId
            }
    }

    get zIndex(): number {
        if (!this.cohort.halfAxisId) return 0
        const offsetSigns = offsetsByHalfAxisId[this.cohort.halfAxisId]
        return 2 * this.cohort.address.generationId * offsetSigns[2]

    }

    get rowOrColumn(): "row" | "column" {
        return this.cohort.halfAxisId && [3, 4, 5, 6, 7, 8].includes(this.cohort.halfAxisId) ?
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






    /**
     * Get the offset to the grandparent Thing (the difference between the centerpoint of the Cohort along its
     * long axis and the midpoint of the grandparent Thing when it is included in the Cohort). This is used to
     * re-center the Cohort so that the Thing Spacer Widget representing the grandparent Thing lines up with
     * the grandparent Thing Widget.
     * @return {number} - The offset to the grandparent Thing.
     */
    get offsetToGrandparentThing(): number {

        // Cohorts in the last, Relationships-only Generation are always empty and don't need to be rendered,
        // so just return 0.
        if (this.cohort.isInRelationshipsOnlyGeneration) {

            return 0

        // For all Cohorts that *do* need to be rendered,
        } else {

            const parentThingOffsetToGrandparentThing = (
                this.cohort.matchedRelationshipsWidgetModel
                && this.cohort.halfAxisId
                && this.cohort.address.parentThingWidgetModel
                && this.cohort.matchedRelationshipsWidgetModel.parentRelationshipsWidgetModel
                && this.cohort.matchedRelationshipsWidgetModel.parentRelationshipsWidgetModel.halfAxisId === halfAxisOppositeIds[this.cohort.halfAxisId]
            ) ?
                (
                    (this.graph.graphWidgetStyle.thingSize + this.graph.graphWidgetStyle.betweenThingSpacing)
                    * this.cohort.address.parentThingWidgetModel.address.indexInCohort
                ) :
                0
 
            const grandparentSpacerOffsetToParentThing = this.indexOfGrandparentThing !== null && this.indexOfGrandparentThing !== -1 ?
                // The difference between the halfway index of the Cohort and the index of the grandparent Thing.
                ((this.cohort.members.length - 1) / 2 - this.indexOfGrandparentThing)
                // The combined width of 1 Thing and 1 gap between Things.
                * (this.graph.graphWidgetStyle.thingSize + this.graph.graphWidgetStyle.betweenThingSpacing) :
                0

            const offsetToGrandparentThing = parentThingOffsetToGrandparentThing + grandparentSpacerOffsetToParentThing

            return offsetToGrandparentThing
            
        }
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