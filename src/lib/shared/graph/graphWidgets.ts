import type { HalfAxisId } from "$lib/shared/constants"
import type { Space, Thing, Note } from "$lib/shared/graph/dbConstructs"
import type { Graph } from "$lib/shared/graph/graph"
import type { Cohort } from "$lib/shared/graph/cohort"

import { oddHalfAxisIds } from "$lib/shared/constants"
import { graphConstructInStore, retrieveGraphConstructs } from "$lib/shared/stores/graphStores"


/*
 * Thing Widget Model.
 * Specifies info to build the widget representing a Thing within a specific Graph Portal.
 */
type ThingAddress = {
    graph: Graph;
    generationId: number,
    parentThingWidgetModel: ThingWidgetModel | null,
    halfAxisId: number | null,
    indexInCohort: number
}

export class ThingWidgetModel {
    kind = "thingWidgetModel"

    thingId: number
    thing: Thing | null
    parentCohort: Cohort | null = null
    childCohortsByHalfAxisId: { [directionId: number]: Cohort } = {}
    inheritSpace = true // For now.

    constructor(thingId: number) {
        this.thingId = thingId
        this.thing = retrieveGraphConstructs("Thing", thingId)
    }

    get thingWidgetId(): string | null {
        if (!this.address) {
            return null
        } else {
            return `portal#${ this.address.graph.id }-thing#${ this.thingId }`
        }
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
    
    get defaultSpaceId(): number | null {
        const defaultSpaceId = this.thing ? this.thing.defaultplane : null
        return defaultSpaceId
    }

    get relatedThingIds(): number[] {
        const relatedThingIds = this.thing ? this.thing.relatedThingIds : []
        return relatedThingIds
    }

    get relatedThingIdsByDirectionId(): { [directionId: number]: number[] } {
        const relatedThingIdsByDirectionId = this.thing ? this.thing.relatedThingIdsByDirectionId : {}
        return relatedThingIdsByDirectionId
    }

    get relatedThingDirectionIds(): number[] {
        const relatedThingDirectionIds = Object.keys(this.relatedThingIdsByDirectionId).map(k => Number(k))
        return relatedThingDirectionIds
    }

    // The following getter functions pass along the corresponding attributes from the Thing Widget's Cohort.
    get parentThingWidgetModel(): ThingWidgetModel | null {
        const parentThingWidgetModel = this.parentCohort && this.parentCohort.address ?
            this.parentCohort.address.parentThingWidgetModel :
            null
        return parentThingWidgetModel
    }

    // The following getter functions are derived from the pass-along getter functions above.
    get address(): ThingAddress | null {
        const address = this.parentCohort ? {
            graph: this.parentCohort.address.graph,
            generationId: this.parentCohort.address.generationId,
            parentThingWidgetModel: this.parentCohort.address.parentThingWidgetModel,
            halfAxisId: this.parentCohort.address.halfAxisId,
            indexInCohort: this.parentCohort.indexOfMember(this) as number
        } : null
        return address
    }

    get space(): Space {
        let space: Space
        // If not inheriting Space from parent, and the Thing Widget Model's own default Space
        // is available, use the Thing Widget Model's own default Space.
        if (
            !( this.parentThingWidgetModel && this.inheritSpace )
            && this.defaultSpaceId && graphConstructInStore("Space", this.defaultSpaceId)
        ) {
            space = retrieveGraphConstructs("Space", this.defaultSpaceId) as Space
        // Else, if the Thing Widget model has a parent, use the parent's Space.
        } else if (this.parentThingWidgetModel) {
            space = this.parentThingWidgetModel.space
        // Else use the first Space in the list of Spaces.
        } else {
            space = retrieveGraphConstructs("Space", 1) as Space//What if there is no spacesStoreValue[1]? Supply an empty Space.
        }
        return space
    }

    get relatedThingHalfAxisIds(): Set<HalfAxisId> {
        const relatedThingHalfAxisIds: Set<HalfAxisId> = new Set()
        for (const directionID of this.relatedThingDirectionIds) {
            const halfAxisId = this.space.halfAxisIdByDirectionId[directionID]
            if (halfAxisId) relatedThingHalfAxisIds.add(halfAxisId)
        }
        return relatedThingHalfAxisIds
    }
    
    get directionIdByHalfAxisId(): { [halfAxisId: number]: number | null } {
        const directionIdByHalfAxisId: { [halfAxisId: number]: number | null } = {};
        for (const oddHalfAxisId of oddHalfAxisIds) {
            const direction = this.space.directions[(oddHalfAxisId - 1)/2];
            directionIdByHalfAxisId[oddHalfAxisId] = direction.id;
            directionIdByHalfAxisId[oddHalfAxisId + 1] = direction.oppositeid;
        }
        return directionIdByHalfAxisId
    }

    get childCohorts(): Cohort[] {
        const childCohorts = Object.values(this.childCohortsByHalfAxisId)
        return childCohorts
    }

    relatedThingIdsByHalfAxisId(halfAxisId: HalfAxisId): number[] {
        const directionId = this.space.directionIdByHalfAxisId[halfAxisId]
        const relatedThingIds = directionId ? this.relatedThingIdsByDirectionId[directionId] : [] as number[]
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
}


export class ThingPlaceholderWidgetModel {
    kind = "thingPlaceholderWidgetModel"

    thingId: number
    thing: Thing | null
    parentCohort: Cohort | null = null

    constructor(thingId: number) {
        this.thingId = thingId
        this.thing = retrieveGraphConstructs("Thing", thingId)
    }
}