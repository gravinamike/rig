import type { HalfAxisId } from "$lib/shared/constants"
import type { NoteDbModel } from "$lib/models/dbModels"
import type { Graph, Cohort } from "$lib/models/graphModels"
import type { ThingCohortWidgetModel } from "$lib/models/widgetModels/thingCohortWidgetModel"
import type { RelationshipCohortWidgetModel } from "$lib/models/widgetModels/relationshipCohortWidgetModel"
import type { RelationshipBeingCreatedInfo } from "$lib/widgets/graphWidgets"

import { ThingBaseWidgetModel } from "./"


/*
 * Thing Widget Model.
 * Specifies info to build the widget representing a Thing within a specific Graph Portal.
 */
export class ThingWidgetModel extends ThingBaseWidgetModel {
    kind = "thingWidgetModel" as const

    childCohortsByHalfAxisId: { [directionId: number]: Cohort } = {}

    childThingCohortWidgetModels: ThingCohortWidgetModel[] = []
    relationshipsWidgetModels: RelationshipCohortWidgetModel[] = []

    constructor(thingId: number | null, graph: Graph) {
        super(thingId, graph)
    }



    







    get thingWidgetId(): string {
        return `graph#${ this.address.graph.id }-thing#${ this.thingId }`
    }

    // The following getter functions pass along the corresponding attributes from the encapsulated Thing.
    get text(): string {
        const text = this.thing ? this.thing.text : ""
        return text
    }

    get note(): NoteDbModel | null {
        const note = this.thing ? this.thing.note : null
        return note
    }

    get childCohorts(): Cohort[] {
        const childCohorts = Object.values(this.childCohortsByHalfAxisId)
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
            if (directionId) {
                const halfAxisId = this.space.halfAxisIdByDirectionId[directionId]
                if (halfAxisId) childThingCohortWidgetModelsByHalfAxisId[halfAxisId] = thingCohortWidgetModel
            }
        }
        return childThingCohortWidgetModelsByHalfAxisId
    }



    relatedThingIdsByHalfAxisId(halfAxisId: HalfAxisId): number[] {/////////////////////// REMOVE THIS
        const directionId = this.space.directionIdByHalfAxisId[halfAxisId]
        const relatedThingIds = directionId && directionId in this.relatedThingIdsByDirectionId ?
            this.relatedThingIdsByDirectionId[directionId] :
            [] as number[]
        return relatedThingIds
    }

    childCohort( halfAxisId: number ): Cohort | null
    childCohort( halfAxisId: number, cohort: Cohort ): void
    childCohort( halfAxisId: number, cohort?: Cohort ): Cohort | null | void {
        if ( cohort === undefined ) {
            return halfAxisId in this.childCohortsByHalfAxisId ? this.childCohortsByHalfAxisId[halfAxisId] : null
        } else {
            // Set child Cohort for this Direction.
            this.childCohortsByHalfAxisId[halfAxisId] = cohort
        }
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
                const halfAxisId = this.space.halfAxisIdByDirectionId[directionId]
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
        return (this.halfAxisId === 8) || (7 in this.childCohortsByHalfAxisId) ? true : false
    }
}