import type { Graph, Cohort } from "$lib/models/graphModels"


export class Plane {
    kind = "plane"

    id: number
    graph: Graph
    cohorts: Cohort[] = []

    constructor(id: number, graph: Graph) {
        this.id = id
        this.graph = graph
    }

    addCohort(cohort: Cohort): void {
        this.cohorts.push(cohort)
        cohort.plane = this
    }

    /**
     * Remove a Cohort from the Graph's Planes.
     * @param {Cohort} cohort - The Cohort which will be removed from the Plane.
     */
    removeCohort( cohort: Cohort ): void {
        const index = this.cohorts.indexOf(cohort)
        if (index > -1) this.cohorts.splice(index, 1)

        if (!this.cohorts.length) delete this.graph.planes._members[this.id]
    }
}