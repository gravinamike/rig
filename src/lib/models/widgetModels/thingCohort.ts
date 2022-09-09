import type { ThingCohort } from "$lib/models/graphModels"
import type { GraphWidgetModel } from "./graph"
import { halfAxisOppositeIds, offsetsByHalfAxisId } from "$lib/shared/constants"
import {
    ThingMissingFromStoreWidgetModel, ThingAlreadyRenderedWidgetModel, ThingWidgetModel,
    RelationshipCohortWidgetModel
} from "$lib/models/widgetModels"


/* Model specifying a Thing Cohort Widget. */
export class ThingCohortWidgetModel {
    kind = "thingCohortWidgetModel"

    cohort: ThingCohort
    graphWidgetModel: GraphWidgetModel
    parentThingWidgetModel: ThingWidgetModel | null

    lifecycleStatus: "new" | "building" | "built" | "failed" | "cleared" = "new"
    memberModels: ( ThingWidgetModel | ThingAlreadyRenderedWidgetModel | ThingMissingFromStoreWidgetModel )[] = []

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
    }

    /**
     * Build the model.
     */
    async build(cyclesLeft: number): Promise< boolean > {
        if (cyclesLeft === 0) return false
        cyclesLeft -= 1

        //console.log("    Building Thing Cohort Widget Model: GEN", this.cohort.address.generationId, "PARENT", this.cohort.address.parentThingId, "DIR", this.cohort.address.directionId)
        this.lifecycleStatus = "building"

        // Reset the array of member Thing Widget Models...
        this.memberModels = []

        // ...then re-populate it with new models based on the Cohort's member Things.
        /*console.log("    Member Thing IDs are:", this.cohort.members.map(
                member => typeof member === "number" ? `MIS ${member}` :
                (this.graphWidgetModel.thingIdsAlreadyInModel.includes(member.id)) ? `SPA ${member}` :
                member.id
            )
        )*/
        for (const member of this.cohort.members) {
            let model: ThingMissingFromStoreWidgetModel | ThingAlreadyRenderedWidgetModel | ThingWidgetModel

            // If the Thing is missing from the store, create a missing-from-store model.
            if (typeof member === "number") {
                model = new ThingMissingFromStoreWidgetModel(member, this.graphWidgetModel, this)

            // Else, if the Thing is already modeled in the Graph, create a spacer model.
            } else if (this.graphWidgetModel.thingIdsAlreadyInModel.includes(member.id)) {
                model = new ThingAlreadyRenderedWidgetModel(member.id, this.graphWidgetModel, this)

            // Else create a Thing Widget Model for that Thing ID.
            } else {///////////////////////////////////////////////////////////////// This is happening with infinite recursion...
                model = new ThingWidgetModel(member.id, this.graphWidgetModel, this)
            }

            // Add the new model to the array of member Thing Widget Models.
            this.addMemberModel(model)

            if (model.kind === "thingWidgetModel") await model.build(cyclesLeft)
        }

        this.lifecycleStatus = "built"
        return true
    }


    //////////////////////////// REWORK COHORTWIDGETMODELS TO TAKE CLADES INSTEAD OF THINGS?





    




    addMemberModel(model: ThingWidgetModel | ThingAlreadyRenderedWidgetModel | ThingMissingFromStoreWidgetModel): void {
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
            this.cohort.members.findIndex( member => (typeof member === "object") && member.id === this.grandparentThingId )
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

    /**
     * Get the IDs of all of the Things in the Cohort Widget Model.
     * @return {number[]} - An array of Thing IDs in the Cohort Widget Model.
     */
    get thingIdsInModel(): number[] {
        let thingIdsInModel: number[] = []
        for (const model of this.memberModels) {////////////////////////////////////////////////// THIS IS EMPTY...
            if (model.thingId) {
                thingIdsInModel.push(model.thingId)
            }
            if (model.kind === "thingWidgetModel") {
                for (const childThingCohortWidgetModel of model.childThingCohortWidgetModels) {
                    const thingIdsInChildThingCohortModel = childThingCohortWidgetModel.thingIdsInModel
                    thingIdsInModel.push(...thingIdsInChildThingCohortModel)
                }
            }
        }
        thingIdsInModel = [...new Set(thingIdsInModel)]
        return thingIdsInModel
    }
}