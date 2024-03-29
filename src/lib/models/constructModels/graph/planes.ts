// Model imports.
import { Graph, ThingCohort, Plane } from "$lib/models/constructModels"


/** Class representing the set of Planes belonging to a Graph. */
export class Planes {
    _graph: Graph
    _members: { [planeId: number]: Plane } = {}

    offsets: [number, number] = [0, 0]
    focalPlaneId = 0

    /**
     * Create the set of Planes belonging to a Graph.
     * @param {Graph} graph - The Graph the Planes belong to.
     */
    constructor(graph: Graph) {
        this._graph = graph
    }

    /**
     * Reset the Planes to their initial, empty state.
     */
    reset(): void {
        this._members = {}
        this.focalPlaneId = 0
    }

    /**
     * Add a Thing Cohort to a Plane by ID (creating the Plane if necessary).
     * @param {ThingCohort} cohort - The Thing Cohort which will be added to the Plane.
     * @param {number} planeId - The ID of the Plane to which the Thing Cohort will be added.
     */
    addCohortToPlane( cohort: ThingCohort, planeId: number ): void {
        if (!(planeId in this._members)) this._members[planeId] = new Plane(planeId, this._graph)
        this._members[planeId].addCohort(cohort)
    }
}