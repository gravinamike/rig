// Type imports.
import type { Graph } from "$lib/models/graphModels"



/** Class representing the Perspective History of a Graph. */
export class PerspectiveHistory {
    _graph: Graph
    _entries: { timestamp: Date, thingId: number }[] = []

    /**
     * Create the Perspective History of the Graph.
     * @param {Graph} graph - The Graph the History belongs to.
     */
    constructor(graph: Graph) {
        this._graph = graph
    }

    /**
     * Add one or multiple Thing IDs to the Perspective History.
     * @param  {number | number[]} thingIds - The Thing ID or IDs to add to the History.
     */
     addEntries( thingIds: number | number[] ): void {
        if (typeof thingIds === "number") thingIds = [thingIds]
        const timestamp = new Date()
        const entries = thingIds.map(
            (thingId) => { return { timestamp: timestamp, thingId: thingId } }
        )
        this._entries.push(...entries)
    }
}