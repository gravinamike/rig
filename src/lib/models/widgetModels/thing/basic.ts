import type { HalfAxisId } from "$lib/shared/constants"
import type { Space, ThingCohort, Thing, Note } from "$lib/models/graphModels"
import type { RelationshipBeingCreatedInfo } from "$lib/widgets/graphWidgets"

import { ThingBaseWidgetModel } from "."
import { GraphWidgetModel, ThingCohortWidgetModel, RelationshipCohortWidgetModel } from "$lib/models/widgetModels"


/* Model specifying a Thing Widget. */
export class ThingWidgetModel extends ThingBaseWidgetModel {
    kind = "thingWidgetModel" as const

    lifecycleStatus: "new" | "building" | "built" | "failed" | "cleared" = "new"
    childThingCohortWidgetModels: ThingCohortWidgetModel[] = []
    relationshipCohortWidgetModels: RelationshipCohortWidgetModel[] = []

    /**
     * Create a Thing Widget Model.
     * @param {number | null} thingId - The ID of the Thing that the widget is based on.
     * @param {GraphWidgetModel} graphWidgetModel - The model of the Graph that the widget is in.
     * @param {ThingWidgetModel} parentThingCohortWidgetModel - The Model of the widget's parent Thing Cohort Widget.
     */
    constructor(
        thingId: number | null,
        graphWidgetModel: GraphWidgetModel,
        parentThingCohortWidgetModel: ThingCohortWidgetModel
    ) {
        super(thingId, graphWidgetModel, parentThingCohortWidgetModel)
    }

    /**
     * Build the model.
     */
    async build(): Promise< boolean > {
        console.log("THINGWIDGET", this.thingId)
        this.lifecycleStatus = "building"

        // If thing has not been initialized correctly, exit with failure.
        if ( !(this.thing && this.thing.space) ) {
            this.lifecycleStatus = "failed"
            return false
        }

        // For each of the Thing's child Thing Cohorts,
        for (const childThingCohort of this.thing.childThingCohorts) {
            // Create a new Thing Cohort Widget Model and add to the array in this model.
            const childThingCohortWidgetModel = new ThingCohortWidgetModel(
                childThingCohort,
                this.graphWidgetModel,
                this
            )
            await childThingCohortWidgetModel.build()
            this.childThingCohortWidgetModel(childThingCohortWidgetModel)

            // Create a new Relationships Widget Model and add to the array in this model.
            const relationshipCohortWidgetModel = new RelationshipCohortWidgetModel(
                childThingCohort,
                this.thing.space,
                this.graphWidgetModel,
                this
            )
            this.childRelationshipCohortWidgetModel(relationshipCohortWidgetModel)
        }

        this.lifecycleStatus = "built"
        return true
    }













    get thingWidgetId(): string {
        return `graph#${ (this.thing as Thing).address.graph.id }-thing#${ this.thingId }`
    }

    // The following getter functions pass along the corresponding attributes from the encapsulated Thing.
    get text(): string {
        const text = this.thing && this.thing.text ? this.thing.text : ""
        return text
    }

    get note(): Note | null {
        const note = this.thing ? this.thing.note : null
        return note
    }



    get childCohorts(): ThingCohort[] {
        const childCohorts = Object.values((this.thing as Thing).childCohortsByHalfAxisId)
        return childCohorts
    }







    get childThingCohortWidgetModelByDirectionId(): { [directionId: number]: ThingCohortWidgetModel } {
        const childThingCohortWidgetModelsByDirectionId: { [directionId: number]: ThingCohortWidgetModel } = {}
        for (const thingCohortWidgetModel of this.childThingCohortWidgetModels) {
            const directionId = thingCohortWidgetModel.cohort.address.directionId
            if (directionId) childThingCohortWidgetModelsByDirectionId[directionId] = thingCohortWidgetModel
        }
        return childThingCohortWidgetModelsByDirectionId
    }

    get childThingCohortWidgetModelByHalfAxisId(): { [halfAxisId: number]: ThingCohortWidgetModel } {
        const childThingCohortWidgetModelsByHalfAxisId: { [halfAxisId: number]: ThingCohortWidgetModel } = {}
        for (const thingCohortWidgetModel of this.childThingCohortWidgetModels) {
            const directionId = thingCohortWidgetModel.cohort.address.directionId
            if (directionId && this.thing?.space) {
                const halfAxisId = this.thing.space.halfAxisIdByDirectionId[directionId]
                if (halfAxisId) childThingCohortWidgetModelsByHalfAxisId[halfAxisId] = thingCohortWidgetModel
            }
        }
        return childThingCohortWidgetModelsByHalfAxisId
    }



    relatedThingIdsByHalfAxisId(halfAxisId: HalfAxisId): number[] {/////////////////////// REMOVE THIS
        const directionId = ((this.thing as Thing).space as Space).directionIdByHalfAxisId[halfAxisId]
        const relatedThingIds = directionId && directionId in this.relatedThingIdsByDirectionId ?
            this.relatedThingIdsByDirectionId[directionId] :
            [] as number[]
        return relatedThingIds
    }

    childThingCohortWidgetModel( thingCohortWidgetModel: ThingCohortWidgetModel ): void {
        this.childThingCohortWidgetModels.push(thingCohortWidgetModel) 
    }











    



    childRelationshipCohortWidgetModel( relationshipsWidgetModel: RelationshipCohortWidgetModel ): void {
        this.relationshipCohortWidgetModels.push(relationshipsWidgetModel)
    }

    get relationshipsWidgetModelsByDirectionId(): { [directionId: number]: RelationshipCohortWidgetModel } {
        const relationshipsWidgetModelsByDirectionId: { [directionId: number]: RelationshipCohortWidgetModel } = {}
        for (const relationshipsWidgetModel of this.relationshipCohortWidgetModels) {
            const directionId = relationshipsWidgetModel.cohort.address.directionId
            if (directionId) relationshipsWidgetModelsByDirectionId[directionId] = relationshipsWidgetModel
        }
        return relationshipsWidgetModelsByDirectionId
    }

    get relationshipsWidgetModelsByHalfAxisId(): { [directionId: number]: RelationshipCohortWidgetModel } {
        const relationshipsWidgetModelsByHalfAxisId: { [directionId: number]: RelationshipCohortWidgetModel } = {}
        for (const relationshipsWidgetModel of this.relationshipCohortWidgetModels) {
            const directionId = relationshipsWidgetModel.cohort.address.directionId
            if (directionId) {
                const halfAxisId = ((this.thing as Thing).space as Space).halfAxisIdByDirectionId[directionId]
                if (halfAxisId) relationshipsWidgetModelsByHalfAxisId[halfAxisId] = relationshipsWidgetModel
            }
        }
        return relationshipsWidgetModelsByHalfAxisId
    }











    relatableForCurrentDrag(relationshipBeingCreatedInfo: RelationshipBeingCreatedInfo): boolean {
        const relatableForCurrentDrag =(
            // There is a drag-relate in progress,
            relationshipBeingCreatedInfo.sourceWidgetModel
            // and the source of the drag is not *this* Thing.
            && !(
                relationshipBeingCreatedInfo.sourceWidgetModel.kind === "thingWidgetModel"
                && relationshipBeingCreatedInfo.sourceWidgetModel.thingId === this.thingId
            )
        ) ?
            true :
            false

        return relatableForCurrentDrag
    }

    // If the Half-Axis is "Outwards, or the Thing has "Inwards" children, it is encapsulating.
    get isEncapsulating(): boolean {
        return (this.halfAxisId === 8) || (7 in (this.thing as Thing).childCohortsByHalfAxisId) ? true : false
    }
}