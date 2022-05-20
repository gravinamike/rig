import type { HalfAxisId } from "$lib/shared/constants"
import type { Graph, Generation, GenerationMember, Plane } from "$lib/models/graphModels"
import type { ThingWidgetModel, RelationshipsWidgetModel } from "$lib/models/widgetModels"

import { offsetsByHalfAxisId } from "$lib/shared/constants"


export type CohortAddress = {
    graph: Graph,
    generationId: number,
    parentThingWidgetModel: ThingWidgetModel | null,
    halfAxisId: HalfAxisId
}

export class Cohort {
    kind = "cohort"

    address: CohortAddress
    generation: Generation | null
    members: GenerationMember[]
    encapsulatingDepth: number
    plane: Plane | null = null
    axialElongation = 1

    constructor(address: CohortAddress, members: GenerationMember[]) {
        this.address = address
        this.members = members
        for (const member of members) member.parentCohort = this

        // Plane.
        let planeId: number
        if (!this.address) {
            planeId = 0
        } else {
            const parentPlaneId = this.parentCohort()?.plane?.id || 0
            const changeInPlane = offsetsByHalfAxisId[this.address?.halfAxisId || 0][2]
            planeId = parentPlaneId + changeInPlane
        }
        this.generation = this.address.generationId === this.address.graph.generations.asArray.length ?
            this.address.graph.generations.relationshipsOnlyGeneration :
            this.address.graph.generations.byId(this.address.generationId)
        this.generation?.cohorts.push(this)
        if (this.generation && !this.generation._isRelationshipsOnly) this.address.graph.planes.addCohortToPlane(this, planeId)

        // Encapsulation depth.
        const parentEncapsulatingDepth = this.parentCohort()?.encapsulatingDepth || 0
        const changeInEncapsulatingDepth = offsetsByHalfAxisId[this.address?.halfAxisId || 0][3]
        this.encapsulatingDepth = parentEncapsulatingDepth + changeInEncapsulatingDepth
    }

    parentCohort(): Cohort | null {
        return this.address.parentThingWidgetModel?.parentCohort || null
    }

    get parentThingId(): number | null {
        return this.address.parentThingWidgetModel?.thingId || null
    }

    indexOfMember(member: GenerationMember): number | null {
        const index = this.members.indexOf(member)
        const output = index !== -1 ? index : null
        return output
    }

    get indexOfGrandparentThing(): number | null {
        const grandparentThingId = this.parentCohort()?.address.parentThingWidgetModel?.thingId || null
    
        let indexOfGrandparentThing = grandparentThingId !== null ? 
            this.members.findIndex( member => member.thingId === grandparentThingId )
            : null

        if (indexOfGrandparentThing === -1) indexOfGrandparentThing = null

        return indexOfGrandparentThing
    }

    rowOrColumn(): "row" | "column" {
        return this.address.halfAxisId !== null && [3, 4, 5, 6, 7, 8].includes(this.address.halfAxisId) ?
            "column" :
            "row"
    }

    addMember(member: GenerationMember): void {
        if (!this.members.includes(member)) {
            this.members.push(member)
            member.parentCohort = this
        }
    }

    removeMember(member: GenerationMember): void {
        const index = this.members.indexOf(member);
        if (index > -1) {
            this.members.splice(index, 1)
        }
    }

    removeFromGroups(): void {
        const generation = this.address.graph.generations.byId(this.address.generationId)
        if (generation) {
            const index = generation.cohorts.indexOf(this)
            if (index > -1) generation.cohorts.splice(index, 1)
        }
        if (this.plane) {
            this.plane.removeCohort(this)
        }
    }





    get matchedRelationshipsWidgetModel(): RelationshipsWidgetModel | null {
        if (this.address.parentThingWidgetModel && this.address.halfAxisId) {
            return this.address.parentThingWidgetModel.relationshipsWidgetModelsByHalfAxisId[this.address.halfAxisId]
        } else {
            return null
        }
    }

    get isInRelationshipsOnlyGeneration(): boolean {
        if (
            this.address.graph.generations.relationshipsOnlyGeneration !== null
            && this.address.generationId === this.address.graph.generations.relationshipsOnlyGeneration.id
        ) {
            return true
        } else {
            return false
        }
    }
}