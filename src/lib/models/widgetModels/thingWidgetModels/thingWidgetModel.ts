import type { HalfAxisId } from "$lib/shared/constants"
import type { Note } from "$lib/models/dbModels"
import type { Graph, Cohort } from "$lib/models/graphModels"
import type { CohortWidgetModel } from "$lib/models/widgetModels/cohortWidgetModel"
import type { RelationshipsWidgetModel } from "$lib/models/widgetModels/relationshipsWidgetModel"

import { ThingBaseWidgetModel } from "./"


/*
 * Thing Widget Model.
 * Specifies info to build the widget representing a Thing within a specific Graph Portal.
 */
export class ThingWidgetModel extends ThingBaseWidgetModel {
    kind = "thingWidgetModel" as const

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

    get note(): Note | null {
        const note = this.thing ? this.thing.note : null
        return note
    }

    get childCohorts(): Cohort[] {
        const childCohorts = Object.values(this.childCohortsByHalfAxisId)
        return childCohorts
    }

    get childCohortWidgetModels(): CohortWidgetModel[] {
        const childCohortWidgetModels = Object.values(this.childCohortWidgetModelsByHalfAxisId)
        return childCohortWidgetModels
    }

    relatedThingIdsByHalfAxisId(halfAxisId: HalfAxisId): number[] {
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

    childCohortWidgetModel( halfAxisId: number ): CohortWidgetModel | null
    childCohortWidgetModel( halfAxisId: number, cohortWigetModel: CohortWidgetModel ): void
    childCohortWidgetModel( halfAxisId: number, cohortWidgetModel?: CohortWidgetModel ): CohortWidgetModel | null | void {
        if ( cohortWidgetModel === undefined ) {
            return halfAxisId in this.childCohortWidgetModelsByHalfAxisId ? this.childCohortWidgetModelsByHalfAxisId[halfAxisId] : null
        } else {
            // Set child Cohort for this Direction.
            this.childCohortWidgetModelsByHalfAxisId[halfAxisId] = cohortWidgetModel
        }
    }

    relationshipsWidgetModel( halfAxisId: number ): RelationshipsWidgetModel | null
    relationshipsWidgetModel( halfAxisId: number, relationshipsWidgetModel: RelationshipsWidgetModel ): void
    relationshipsWidgetModel( halfAxisId: number, relationshipsWidgetModel?: RelationshipsWidgetModel ): RelationshipsWidgetModel | null | void {
        if ( relationshipsWidgetModel === undefined ) {
            return halfAxisId in this.relationshipsWidgetModelsByHalfAxisId ? this.relationshipsWidgetModelsByHalfAxisId[halfAxisId] : null
        } else {
            // Set child Cohort for this Direction.
            this.relationshipsWidgetModelsByHalfAxisId[halfAxisId] = relationshipsWidgetModel
        }
    }
}