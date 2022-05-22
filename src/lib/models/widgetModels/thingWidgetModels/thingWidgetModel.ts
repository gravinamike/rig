import type { HalfAxisId } from "$lib/shared/constants"
import type { NoteDbModel } from "$lib/models/dbModels"
import type { Graph, Cohort } from "$lib/models/graphModels"
import type { CohortWidgetModel } from "$lib/models/widgetModels/cohortWidgetModel"
import type { RelationshipsWidgetModel } from "$lib/models/widgetModels/relationshipsWidgetModel"
import type { RelationshipBeingCreatedInfo } from "$lib/widgets/graphWidgets"

import { ThingBaseWidgetModel } from "./"


/*
 * Thing Widget Model.
 * Specifies info to build the widget representing a Thing within a specific Graph Portal.
 */
export class ThingWidgetModel extends ThingBaseWidgetModel {
    kind = "thingWidgetModel" as const

    childCohortsByHalfAxisId: { [directionId: number]: Cohort } = {}

    childCohortWidgetModels: CohortWidgetModel[] = []
    relationshipsWidgetModels: RelationshipsWidgetModel[] = []

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







    get childCohortWidgetModelByDirectionId(): { [directionId: number]: CohortWidgetModel } {
        const childCohortWidgetModelsByDirectionId: { [directionId: number]: CohortWidgetModel } = {}
        for (const cohortWidgetModel of this.childCohortWidgetModels) {
            const directionId = cohortWidgetModel.cohort.address.directionId
            if (directionId) childCohortWidgetModelsByDirectionId[directionId] = cohortWidgetModel
        }
        return childCohortWidgetModelsByDirectionId
    }

    get childCohortWidgetModelByHalfAxisId(): { [halfAxisId: number]: CohortWidgetModel } {
        const childCohortWidgetModelsByHalfAxisId: { [halfAxisId: number]: CohortWidgetModel } = {}
        for (const cohortWidgetModel of this.childCohortWidgetModels) {
            const directionId = cohortWidgetModel.cohort.address.directionId
            if (directionId) {
                const halfAxisId = this.space.halfAxisIdByDirectionId[directionId]
                if (halfAxisId) childCohortWidgetModelsByHalfAxisId[halfAxisId] = cohortWidgetModel
            }
        }
        return childCohortWidgetModelsByHalfAxisId
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

    childCohortWidgetModel( cohortWidgetModel: CohortWidgetModel ): void {
        this.childCohortWidgetModels.push(cohortWidgetModel) 
    }











    



    relationshipsWidgetModel( relationshipsWidgetModel: RelationshipsWidgetModel ): void {
        this.relationshipsWidgetModels.push(relationshipsWidgetModel)
    }

    get relationshipsWidgetModelsByDirectionId(): { [directionId: number]: RelationshipsWidgetModel } {
        const relationshipsWidgetModelsByDirectionId: { [directionId: number]: RelationshipsWidgetModel } = {}
        for (const relationshipsWidgetModel of this.relationshipsWidgetModels) {
            const directionId = relationshipsWidgetModel.cohort.address.directionId
            if (directionId) relationshipsWidgetModelsByDirectionId[directionId] = relationshipsWidgetModel
        }
        return relationshipsWidgetModelsByDirectionId
    }

    get relationshipsWidgetModelsByHalfAxisId(): { [directionId: number]: RelationshipsWidgetModel } {
        const relationshipsWidgetModelsByHalfAxisId: { [directionId: number]: RelationshipsWidgetModel } = {}
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