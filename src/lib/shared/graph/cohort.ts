import type { HalfAxisId } from "$lib/shared/constants"
import type { Graph } from "$lib/shared/graph/graph"
import type { GenerationMember } from "$lib/shared/graph/generation"
import type { Plane } from "$lib/shared/graph/plane"
import type { ThingWidgetModel } from "$lib/shared/graph/graphWidgets"

import { offsetsByHalfAxisId } from "$lib/shared/constants"


type CohortAddress = {
    graph: Graph,
    generationId: number,
    parentThingWidgetModel: ThingWidgetModel | null,
    halfAxisId: HalfAxisId | null
}

export class Cohort {
    kind = "cohort"

    address: CohortAddress
    members: GenerationMember[]
    encapsulatingDepth: number
    plane: Plane | null = null

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
        const generation = this.address.graph.generations[this.address.generationId]
        generation.cohorts.push(this)
        this.address.graph.addCohortToPlane(this, planeId)

        // Encapsulation depth.
        const parentEncapsulatingDepth = this.parentCohort()?.encapsulatingDepth || 0
        const changeInEncapsulatingDepth = offsetsByHalfAxisId[this.address?.halfAxisId || 0][3]
        this.encapsulatingDepth = parentEncapsulatingDepth + changeInEncapsulatingDepth
    }

    parentCohort(): Cohort | null {
        return this.address.parentThingWidgetModel?.parentCohort || null
    }

    indexOfMember(member: GenerationMember): number | null {
        const index = this.members.indexOf(member)
        const output = index !== -1 ? index : null
        return output
    }

    removeFromGroups(): void {
        const generation = this.address.graph.generationById(this.address.generationId)
        if (generation) {
            const index = generation.cohorts.indexOf(this)
            if (index > -1) generation.cohorts.splice(index, 1)
        }
        if (this.plane) {
            this.plane.removeCohort(this)
        }
    }

}