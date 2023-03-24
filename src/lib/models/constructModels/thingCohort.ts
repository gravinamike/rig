import type { Direction, Space, Graph, Generation, GenerationMember, Plane, Thing } from "$lib/models/constructModels"

import { offsetsByHalfAxisId, type HalfAxisId } from "$lib/shared/constants"
import { getGraphConstructs } from "$lib/stores"


export type CohortAddress = {
    graph: Graph,
    generationId: number,
    parentThingId: number | null,
    directionId: number | null
}

export class ThingCohort {
    kind = "thingCohort"

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
        for (const member of members) if (member.thing) member.thing.parentCohort = this

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

    parentCohort(): ThingCohort | null {
        return this.parentThing?.parentCohort || null
    }

    get parentThingId(): number | null {
        return this.address.parentThingId || null
    }

    indexOfMemberById(thingId: number): number | null {
        const index = this.members.findIndex( member => member.thingId === thingId )
        const output = index !== -1 ? index : null
        return output
    }

    get indexOfGrandparentThing(): number | null {
        const grandparentThingId = this.parentCohort()?.address.parentThingId || null
    
        let indexOfGrandparentThing = grandparentThingId !== null ? 
            this.members.findIndex( member => member.thingId === grandparentThingId )
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
            if (member.thing) {
                if (!member.thing.parentCohort) member.thing.parentCohort = this
                member.thing.graph = this.address.graph
            }
        }
    }

    removeMemberById(thingId: number): void {
        const index = this.members.findIndex(member => member.thingId === thingId);
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

    get direction(): Direction {
        return getGraphConstructs("Direction", this.address.directionId as number) as Direction
    }
}