import type { HalfAxisId } from "$lib/shared/constants"
import type { Space, Thing } from "$lib/models/dbModels"
import type { Cohort } from "$lib/models/graphModels"
import type { ThingAddress, ThingWidgetModel } from "./"

import { oddHalfAxisIds } from "$lib/shared/constants"
import { graphConstructInStore, retrieveGraphConstructs } from "$lib/stores"


export class ThingBaseWidgetModel {
    kind = "thingBaseWidgetModel"

    thingId: number | null
    thing: Thing | null
    _parentCohort: Cohort | null = null
    childCohortsByHalfAxisId: { [directionId: number]: Cohort } = {}
    inheritSpace = true // For now.

    constructor(thingId: number | null) {
        this.thingId = thingId
        this.thing = typeof thingId === "number" ? retrieveGraphConstructs("Thing", thingId) : null
    }

    get parentCohort(): Cohort {
        return this._parentCohort as Cohort
    }

    set parentCohort(cohort: Cohort) {
        this._parentCohort = cohort
    }

    // The following getter functions pass along the corresponding attributes from the encapsulated Thing.
    get defaultSpaceId(): number | null {
        const defaultSpaceId = this.thing ? this.thing.defaultplane : null
        return defaultSpaceId
    }

    get relatedThingIds(): (number | null)[] {
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

    get halfAxisId(): number {
        return this.parentCohort.address.halfAxisId || 0
    }

    get encapsulatingDepth(): number {
        return this.parentCohort.encapsulatingDepth
    }

    // The following getter functions are derived from the pass-along getter functions above.
    get address(): ThingAddress {
        const address = {
            graph: this.parentCohort.address.graph,
            generationId: this.parentCohort.address.generationId,
            parentThingWidgetModel: this.parentCohort.address.parentThingWidgetModel,
            halfAxisId: this.parentCohort.address.halfAxisId,
            indexInCohort: this.parentCohort.indexOfMember(this) as number
        }
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

    get isEncapsulating(): boolean {
        return (this.halfAxisId === 8) || (7 in this.childCohortsByHalfAxisId) ? true : false
    }

    get planeId(): number {
        const planeId = [7, 8].includes(this.halfAxisId) && this.parentThingWidgetModel ?
            // If the Thing is on the encapsulating axis, inherit the Plane from the Thing's parent Thing.
            this.parentThingWidgetModel.parentCohort.plane?.id || 0 :
            // Otherwise use the Thing's own Plane.
            this.parentCohort.plane?.id || 0
        return planeId
    }

    get elongation(): number {
        return this.parentCohort.axialElongation
    }

    get elongationCategory(): "vertical" | "horizontal" | "neutral" {
        const elongationCategory = [1, 2, 3, 4].includes(this.halfAxisId) ?
            ( [1, 2].includes(this.halfAxisId) ? "vertical" : "horizontal" ) :
            "neutral"
        return elongationCategory
    }

    get xYElongation(): {x: number, y: number} {
        const elongation = this.elongation
        let xYElongation: {x: number, y: number}
        switch (this.elongationCategory) {
            case "vertical": 
                xYElongation = {x: 1, y: elongation}; break
            case "horizontal":
                xYElongation = {x: elongation, y: 1}; break
            case "neutral":
                xYElongation = {x: elongation, y: elongation}; break
        }
        return xYElongation
    }

    get cohortSize(): number {
        return this.parentCohort.members.length || 1
    }
}