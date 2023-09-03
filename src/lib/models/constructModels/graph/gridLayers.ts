// Import types.
import type { Graph, ThingCohort } from "$lib/models/constructModels"
// Import Grid Layer class.
import { GridLayer } from "../gridLayer"
// Import utility functions.
import { removeItemFromArray } from "$lib/shared/utility"



/**
 * Grid Layers class.
 * 
 * Represents a collection of a Graph's Grid Layers, meaning the concentric
 * squares of Things around the Graph's center when it is built using the
 * "grid" method.
 */
export class GridLayers {
    // The Graph that these Grid Layers belong to.
    #graph: Graph

    // The member Grid Layers of this Grid Layers object.
    #members: GridLayer[] = []

    
    /**
     * Grid Layers constructor.
     * 
     * Creates the set of Grid Layers belonging to a Graph.
     * @param {Graph} graph - The Graph the Grid Layers belong to.
     */
    constructor(graph: Graph) {
        this.#graph = graph
    }


    /* Basic getters and setters. */

    /**
     * Grid-Layers-as-array getter.
     * 
     * Gets the Grid Layers as an array (as an attribute of Grid Layers).
     */
    get asArray(): GridLayer[] {
        return this.#members
    }

    /**
     * Grid-Layer-by-ID method.
     * 
     * Get one of the Grid Layers by ID. (Its ID is equal to its index in
     * this.#members).
     * @param gridLayerId - The ID (index) of the Grid Layer to retrieve.
     * @returns - The specified Grid Layer (or null if it doesn't exist).
     */
    byId( gridLayerId: number ): GridLayer | null {
        const gridLayer =
            ( 0 <= gridLayerId && gridLayerId < this.#members.length ) ? this.#members[gridLayerId] :
            null
        return gridLayer
    }

    /**
     * Reset-Grid-Layers method.
     * 
     * Resets the Grid Layers to their initial, empty state.
     */
    reset(): void {
        this.#members = []
    }


    /* Methods to access information for building/stripping the Grid Layers. */

    /**
     * Grid-Layer-ID-to-strip getter.
     * 
     * Gets the ID of the next Grid Layer to be stripped, as an attribute.
     * @returns - The ID of the next Grid Layer to be stripped.
     */
    get idToStrip(): number {
        // Return the ID (index) of the latest Grid Layer.
        return this.#members.length - 1
    }
    


    
    /* Methods for building/stripping Grid Layers. */

    /**
     * Add-Thing-Cohort-to-Grid-Layer method.
     * 
     * Adds a Thing Cohort to a Grid Layer by layer ID. If that layer doesn't
     * exist yet, builds Grid Layers until it does.
     * @param thingCohort - The Thing Cohort to add.
     * @param gridLayerId - The ID of the Grid Layer to add to.
     */
    async addThingCohortToGridLayer(thingCohort: ThingCohort, gridLayerId: number) {
        // If the Thing Cohort doesn't have a Grid Layer yet,
        if (!thingCohort.gridLayer) {
            // Build Grid Layers until the specified Grid Layer ID exists.
            await this.addEmptyGridLayersToTargetId(gridLayerId)

            // Get the Grid Layer corresponding to the specified ID. (If none
            // exists, abort.)
            const gridLayerToAddTo = this.byId(gridLayerId)
            if (!gridLayerToAddTo) return
            
            // Add the Thing Cohort to the Grid Layer, and set the Grid Layer
            // as the Grid Layer of the Thing Cohort.
            gridLayerToAddTo.thingCohorts.push(thingCohort)
            thingCohort.gridLayer = gridLayerToAddTo
        }
    }
        
    /**
     * Add-empty-Grid-Layers-to-target-ID method.
     * 
     * Adds empty Grid Layers until the specified Grid Layer ID has been reached.
     * @param targetGridLayerId - The ID of the Grid Layer to build to.
     */
    async addEmptyGridLayersToTargetId(targetGridLayerId: number) {
        // While the specified ID hasn't been reached yet,
        while ( this.#members.length - 1 < targetGridLayerId ) {
            // Get the ID of the next Grid Layer to add.
            const newGridLayerId = this.#members.length

            // Create a new Grid Layer with that ID and add it to the Grid
            // Layers object.
            const newGridLayer = new GridLayer(newGridLayerId, this.#graph)
            this.#members.push(newGridLayer)
        }
    }

    /**
     * Remove-Thing-Cohort-from-Grid-Layer method.
     * 
     * Removes a Thing Cohort from a Grid Layer by layer ID.
     * @param thingCohort - The Thing Cohort to remove.
     * @param gridLayerId - The ID of the Grid Layer to remove from.
     */
    async removeThingCohortFromGridLayer(thingCohort: ThingCohort, gridLayerId: number) {
        // Get the Grid Layer corresponding to the specified ID. (If none
        // exists, abort.)
        const gridLayerToAddTo = this.byId(gridLayerId)
        if (!gridLayerToAddTo) return
        
        // Remove the Thing Cohort from the Grid Layer, and un-set the Grid
        // Layer as the Grid Layer of the Thing Cohort.
        removeItemFromArray(gridLayerToAddTo.thingCohorts, thingCohort)
        thingCohort.gridLayer = null
    }

    /**
     * Strip-Grid-Layer method.
     * 
     * Strip the most recent Grid Layer from the Graph.
     */
    async stripGridLayer(): Promise<void> {
        // Get the ID of the Grid Layer to strip. If there is none, abort.
        const gridLayerToStrip = this.byId(this.idToStrip)
        if (!gridLayerToStrip) return

        // Mark the Grid Layer as in the process of stripping.
        gridLayerToStrip.lifecycleStatus = "stripping"

        // For each Thing Cohort of the Grid Layer,
        for (const cohort of gridLayerToStrip.thingCohorts) {
            // Clear the Thing Cohort's members.
            cohort.members = []
            // Remove the Cohort from its Generation, Grid Layer, and Plane.
            cohort.removeFromGroups()
        }

        // Remove the Grid Layer from the graph.
        const index = this.#members.indexOf(gridLayerToStrip)
        if (index > -1) this.#members.splice(index, 1)

        // Mark the Grid Layer as stripped.
        gridLayerToStrip.lifecycleStatus = "stripped"
    }
}