import type { HalfAxisId } from "$lib/shared/constants"
import type { ThingDbModel } from "$lib/models/dbModels"
import type { Graph, Space, Cohort } from "$lib/models/graphModels"
import type { ThingAddress, ThingWidgetModel } from "./"

import { oddHalfAxisIds, planePadding } from "$lib/shared/constants"
import { graphConstructInStore, retrieveGraphConstructs } from "$lib/stores"


export class ThingBaseWidgetModel {
    kind = "thingBaseWidgetModel"

    thingId: number | null
    thing: ThingDbModel | null
    graph: Graph
    _parentCohort: Cohort | null = null
    inheritSpace = true // For now.

    constructor(thingId: number | null, graph: Graph) {
        this.thingId = thingId
        this.thing = typeof thingId === "number" ? retrieveGraphConstructs("Thing", thingId) : null
        this.graph = graph
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

    
    
    offAxisRelatedThingIds(space=this.space): number[] {
        const offAxisRelatedThingIds: number[] = []

        const onAxisDirectionIds: number[] = []

        for (const direction of space.directions) {
            if (direction.id) onAxisDirectionIds.push(direction.id)
            if (direction.oppositeid) onAxisDirectionIds.push(direction.oppositeid)
        }



        for (const directionId of this.relatedThingDirectionIds) {
            if (!(onAxisDirectionIds.includes(directionId))) {
                offAxisRelatedThingIds.push(...this.relatedThingIdsByDirectionId[directionId])
            }
        }
        return offAxisRelatedThingIds
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

    get halfAxisId(): HalfAxisId | 0 {
        return this.parentCohort.halfAxisId || 0
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
            halfAxisId: this.parentCohort.halfAxisId,
            indexInCohort: this.parentCohort.indexOfMember(this) as number
        }
        return address
    }

    get space(): Space {
        let space: Space

        // If the Graph has a starting Space and this is the Perspective Thing,
        // use the starting Space.
        if (this.graph.startingSpace && !this.parentThingWidgetModel) {
            space = this.graph.startingSpace
            
        // Else, if...
        } else if (
            (
                // ... the Thing Widget Model doesn't have a parent,
                !this.parentThingWidgetModel
                // ... or is set not to inherit Space from a parent,
                || !this.inheritSpace
            )
            && (
                // ... and the Thing Widget Model has a default Space set,
                this.defaultSpaceId
                // ... and that default Space is in the Store,
                && graphConstructInStore("Space", this.defaultSpaceId)
            )
        ) {
            // ...use the Thing Widget Model's own default Space.
            space = retrieveGraphConstructs<Space>("Space", this.defaultSpaceId) as Space

        // Else, if the Thing Widget model has a parent, inherit the parent's Space.
        } else if (this.parentThingWidgetModel) {
            space = this.parentThingWidgetModel.space

        // If all else fails, just use the first Space in the list of Spaces.
        } else {
            space = retrieveGraphConstructs<Space>("Space", 1) as Space//What if there is no spacesStoreValue[1]? Supply an empty Space.
        }

        return space
    }

    get cohortSize(): number {
        return this.parentCohort.members.length || 1
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











    



    get encapsulatingPadding(): number {
        return this.encapsulatingDepth >= 0 ? 40 : 20
    }


    get thingSize(): number {
        return (
            this.graph.graphWidgetStyle.thingSize
            + planePadding * this.planeId
            + this.encapsulatingPadding * this.encapsulatingDepth
        )
    } 

    get thingWidth(): number {
        return this.thingSize * this.xYElongation.x
    }

    get thingHeight(): number {
        return this.encapsulatingDepth >= 0 ?
            this.thingSize * this.xYElongation.y :
            this.thingSize * this.xYElongation.y / this.cohortSize - 2
    }





}