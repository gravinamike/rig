import type { ThingCohort } from "$lib/models/graphModels"
import type { GraphWidgetModel } from "./graph"
import { halfAxisOppositeIds, offsetsByHalfAxisId } from "$lib/shared/constants"
import { graphConstructInStore } from "$lib/stores"
import {
    ThingBaseWidgetModel, ThingWidgetModel, ThingMissingFromStoreWidgetModel,
    RelationshipCohortWidgetModel
} from "$lib/models/widgetModels"


/* Model specifying a Thing Cohort Widget. */
export class ThingCohortWidgetModel {
    kind = "thingCohortWidgetModel"

    cohort: ThingCohort
    graphWidgetModel: GraphWidgetModel
    parentThingWidgetModel: ThingWidgetModel | null
    memberModels: ( ThingWidgetModel | ThingBaseWidgetModel | ThingMissingFromStoreWidgetModel )[] = []

    /**
     * Create a Graph Widget Model.
     * @param {ThingCohort} cohort - The Thing Cohort that the widget is based on.
     * @param {GraphWidgetModel} graphWidgetModel - The model of the Graph that the widget is in.
     * @param {ThingWidgetModel} parentThingWidgetModel - The Model of the widget's parent Thing Widget, if it has one.
     */
    constructor(
        cohort: ThingCohort,
        graphWidgetModel: GraphWidgetModel,
        parentThingWidgetModel?: ThingWidgetModel
    ) {
        this.cohort = cohort
        this.graphWidgetModel = graphWidgetModel
        this.parentThingWidgetModel = parentThingWidgetModel === undefined ? null : parentThingWidgetModel

        // Build the model.
        this.build()
    }

    /**
     * Build the model.
     */
    async build(): Promise< void > {
        // Reset the array of member Thing Widget Models...
        this.memberModels = []

        // ...then re-populate it with new models based on the Cohort's member Things.
        for (const member of this.cohort.members) {
            // Create a model based on the Thing.
            const model = (
                // If the Thing is null, create a missing-from-store model.
                !member ?
                    new ThingMissingFromStoreWidgetModel(null, this.graphWidgetModel, this) :
                // Else, if the Thing is already modeled in the Graph, create a spacer model.
                this.graphWidgetModel.graph.thingIdsAlreadyInGraph.includes(member.id) ?
                    new ThingBaseWidgetModel(member.id, this.graphWidgetModel, this) :
                // Else, if the Thing is in the Thing store, create a model for that Thing ID.
                graphConstructInStore("Thing", member.id) ?
                    new ThingWidgetModel(member.id, this.graphWidgetModel, this) :
                // Else create a missing-from-store model.
                new ThingMissingFromStoreWidgetModel(member.id, this.graphWidgetModel, this)
            )
            
            // Add the new model to the array of member Thing Widget Models.
            this.addMemberModel(model)
        }
    }


    //////////////////////////// REWORK COHORTWIDGETMODELS TO TAKE CLADES INSTEAD OF THINGS?





    




    addMemberModel(model: ThingWidgetModel | ThingBaseWidgetModel | ThingMissingFromStoreWidgetModel): void {
        this.memberModels.push(model)
        model.parentThingCohortWidgetModel = this
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
                x: this.graphWidgetModel.style.relationDistance * offsetSigns[0]
                    + this.graphWidgetModel.graph.planes.offsets[0] * this.planeId,
                y: this.graphWidgetModel.style.relationDistance * offsetSigns[1]
                    + this.graphWidgetModel.graph.planes.offsets[1] * this.planeId
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
        return this.cohort.parentCohort()?.address.parentThingId || null
    }

    // If the Cohort contains its own doubled-back grandparent Thing, get the index of that Thing in the Cohort.
    ////////////////////////////////////////////////////// MOVE THIS TO COHORT ITSELF INSTEAD OF WIDGET MODEL?
    get indexOfGrandparentThing(): number | null {
        return this.grandparentThingId !== null ? 
            this.cohort.members.findIndex( member => member && member.id === this.grandparentThingId )
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
                this.matchedRelationshipsWidgetModel
                && this.cohort.halfAxisId
                && this.cohort.parentThing
                && this.matchedRelationshipsWidgetModel.parentRelationshipsWidgetModel
                && this.matchedRelationshipsWidgetModel.parentRelationshipsWidgetModel.halfAxisId === halfAxisOppositeIds[this.cohort.halfAxisId]
            ) ?
                (
                    (this.graphWidgetModel.style.thingSize + this.graphWidgetModel.style.betweenThingSpacing)
                    * this.cohort.parentThing.address.indexInCohort
                ) :
                0
 
            const grandparentSpacerOffsetToParentThing = this.indexOfGrandparentThing !== null && this.indexOfGrandparentThing !== -1 ?
                // The difference between the halfway index of the Cohort and the index of the grandparent Thing.
                ((this.cohort.members.length - 1) / 2 - this.indexOfGrandparentThing)
                // The combined width of 1 Thing and 1 gap between Things.
                * (this.graphWidgetModel.style.thingSize + this.graphWidgetModel.style.betweenThingSpacing) :
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


    get matchedRelationshipsWidgetModel(): RelationshipCohortWidgetModel | null {
        if (this.parentThingWidgetModel && this.cohort.halfAxisId) {
            return this.parentThingWidgetModel.relationshipsWidgetModelsByHalfAxisId[this.cohort.halfAxisId]
        } else {
            return null
        }
    }
}