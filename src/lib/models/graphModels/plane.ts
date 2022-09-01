import type { Graph, ThingCohort } from "$lib/models/graphModels"


export class Plane {
    kind = "plane"

    id: number
    graph: Graph
    cohorts: ThingCohort[] = []

    constructor(id: number, graph: Graph) {
        this.id = id
        this.graph = graph
    }

    addCohort(cohort: ThingCohort): void {
        this.cohorts.push(cohort)
        cohort.plane = this
    }

    /**
     * Remove a Thing Cohort from the Graph's Planes.
     * @param {ThingCohort} cohort - The Thing Cohort which will be removed from the Plane.
     */
    removeCohort( cohort: ThingCohort ): void {
        const index = this.cohorts.indexOf(cohort)
        if (index > -1) this.cohorts.splice(index, 1)

        if (!this.cohorts.length) delete this.graph.planes._members[this.id]
    }
}