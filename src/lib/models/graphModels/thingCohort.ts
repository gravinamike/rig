import type { Space, Graph, Generation, GenerationMember, Plane, Thing } from "$lib/models/graphModels"

import { offsetsByHalfAxisId, type HalfAxisId } from "$lib/shared/constants"


export type CohortAddress = {
    graph: Graph,
    generationId: number,
    parentThingId: number | null,
    directionId: number | null
}

export class Cohort {
    kind = "cohort"

    address: CohortAddress
    generation: Generation | null
    parentThing: Thing | null = null
    members: GenerationMember[]
    encapsulatingDepth: number
    plane: Plane | null = null
    axialElongation = 1

    constructor(address: CohortAddress, members: GenerationMember[]) {
        this.address = address
        this.members = members
        for (const member of members) if (member) member.parentCohort = this

        // Plane.
        let planeId: number
        if (!this.address) {
            planeId = 0
        } else {
            const parentPlaneId = this.parentCohort()?.plane?.id || 0
            const changeInPlane = offsetsByHalfAxisId[this.halfAxisId || 0][2]
            planeId = parentPlaneId + changeInPlane
        }
        this.generation = this.address.generationId === this.address.graph.generations.asArray.length ?
            this.address.graph.generations.relationshipsOnlyGeneration :
            this.address.graph.generations.byId(this.address.generationId)
        this.generation?.cohorts.push(this)
        if (this.generation && !this.generation._isRelationshipsOnly) this.address.graph.planes.addCohortToPlane(this, planeId)

        // Encapsulation depth.
        const parentEncapsulatingDepth = this.parentCohort()?.encapsulatingDepth || 0
        const changeInEncapsulatingDepth = offsetsByHalfAxisId[this.halfAxisId || 0][3]
        this.encapsulatingDepth = parentEncapsulatingDepth + changeInEncapsulatingDepth
    }

    get halfAxisId(): HalfAxisId {
        return (
            this.address.directionId
            && this.parentThing
        ) ?
            (this.parentThing.space as Space).halfAxisIdByDirectionId[this.address.directionId] :
            0
    }

    parentCohort(): Cohort | null {
        return this.parentThing?.parentCohort || null
    }

    get parentThingId(): number | null {
        return this.address.parentThingId || null
    }

    indexOfMember(member: GenerationMember): number | null {
        const index = this.members.indexOf(member)
        const output = index !== -1 ? index : null
        return output
    }

    get indexOfGrandparentThing(): number | null {
        const grandparentThingId = this.parentCohort()?.address.parentThingId || null
    
        let indexOfGrandparentThing = grandparentThingId !== null ? 
            this.members.findIndex( member => member && member.id === grandparentThingId )
            : null

        if (indexOfGrandparentThing === -1) indexOfGrandparentThing = null

        return indexOfGrandparentThing
    }

    rowOrColumn(): "row" | "column" {
        return this.halfAxisId !== null && [3, 4, 5, 6, 7, 8].includes(this.halfAxisId) ?
            "column" :
            "row"
    }

    addMember(member: GenerationMember): void {
        if (!this.members.includes(member)) {
            this.members.push(member)
            if (member) member.parentCohort = this
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