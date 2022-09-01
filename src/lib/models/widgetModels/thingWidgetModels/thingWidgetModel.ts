import type { HalfAxisId } from "$lib/shared/constants"
import type { Space, Cohort, Note, Thing } from "$lib/models/graphModels"
import type { RelationshipBeingCreatedInfo } from "$lib/widgets/graphWidgets"

import { ThingBaseWidgetModel } from "./"
import { GraphWidgetModel, ThingCohortWidgetModel, RelationshipCohortWidgetModel } from "$lib/models/widgetModels"


/*
 * Thing Widget Model.
 * Specifies info to build the widget representing a Thing within a specific Graph Portal.
 */
export class ThingWidgetModel extends ThingBaseWidgetModel {
    kind = "thingWidgetModel" as const

    childThingCohortWidgetModels: ThingCohortWidgetModel[] = []
    relationshipsWidgetModels: RelationshipCohortWidgetModel[] = []

    constructor(thingId: number | null, graphWidgetModel: GraphWidgetModel, parentThingCohortWidgetModel: ThingCohortWidgetModel) {
        super(thingId, graphWidgetModel, parentThingCohortWidgetModel)

        this.build()
    }



    
    async build(): Promise< void > {
        if (this.thing) {
            for (const childThingCohort of this.thing.childThingCohorts) {
                // Create a new Cohort Widget Model and assign to the previous Generation's Thing in that Direction.
                const childThingCohortWidgetModel = new ThingCohortWidgetModel(childThingCohort, this.graphWidgetModel, this)
                this.childThingCohortWidgetModel(childThingCohortWidgetModel)
    
                // Create a new Relationships Widget Model and assign to the previous Generation's Thing in that Direction.
                const relationshipsWidgetModel = new RelationshipCohortWidgetModel(childThingCohort, this.thing.space as Space, this.graphWidgetModel, this)
                this.relationshipsWidgetModel(relationshipsWidgetModel)
            }
        }
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



    get childCohorts(): Cohort[] {
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











    



    relationshipsWidgetModel( relationshipsWidgetModel: RelationshipCohortWidgetModel ): void {
        this.relationshipsWidgetModels.push(relationshipsWidgetModel)
    }

    get relationshipsWidgetModelsByDirectionId(): { [directionId: number]: RelationshipCohortWidgetModel } {
        const relationshipsWidgetModelsByDirectionId: { [directionId: number]: RelationshipCohortWidgetModel } = {}
        for (const relationshipsWidgetModel of this.relationshipsWidgetModels) {
            const directionId = relationshipsWidgetModel.cohort.address.directionId
            if (directionId) relationshipsWidgetModelsByDirectionId[directionId] = relationshipsWidgetModel
        }
        return relationshipsWidgetModelsByDirectionId
    }

    get relationshipsWidgetModelsByHalfAxisId(): { [directionId: number]: RelationshipCohortWidgetModel } {
        const relationshipsWidgetModelsByHalfAxisId: { [directionId: number]: RelationshipCohortWidgetModel } = {}
        for (const relationshipsWidgetModel of this.relationshipsWidgetModels) {
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