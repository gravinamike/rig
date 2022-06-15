import type { GraphWidgetStyle } from "$lib/shared/constants"
import type { SpaceDbModel, ThingDbModel } from "$lib/models/dbModels"
import type { Cohort } from "$lib/models/graphModels"
import type { ThingCohortWidgetModel, ThingBaseWidgetModel } from "$lib/models/widgetModels"

import { defaultGraphWidgetStyle } from "$lib/shared/constants"
import { storeGraphConstructs, retrieveGraphConstructs, unstoreGraphConstructs } from "$lib/stores"
import { Generations } from "./generations"
import { Planes } from "./planes"
import { PerspectiveHistory } from "./history"
import { deleteThing, deleteRelationship, markThingsVisited } from "$lib/db/clientSide/makeChanges"


/** Class representing a Graph. */
export class Graph {
    id: number
    _pThingIds: number[]
    _depth: number
    parentGraph: Graph | null
    childGraphs: Graph[] = []
    rootCohort: Cohort | null = null
    rootThingCohortWidgetModel: ThingCohortWidgetModel | null = null
    generations: Generations
    planes: Planes
    history: PerspectiveHistory
    lifecycleStatus: "new" | "building" | "built" | "cleared" = "new"
    startingSpace: SpaceDbModel | null

    ////////////////////////////////////////////////// Put into widgetmodel
    graphWidgetStyle: GraphWidgetStyle = {...defaultGraphWidgetStyle}
    thingIdToScrollTo: number | null = null
    allowScrollToThingId = false
    allowZoomAndScrollToFit = false
    formActive = false

    /**
     * Create a Graph.
     * @param {number[]} pThingIds - IDs for the Graph's starting Perspective Things.
     * @param {number}   depth     - How many Relationship "steps" to grow the Graph from the Perspective Things.
     */
    constructor(id: number, pThingIds: number[], depth: number, parentGraph: (Graph | null)=null, offAxis=false, startingSpace: (SpaceDbModel | null)=null) {
        this.id = id
        this._pThingIds = pThingIds
        this._depth = depth
        this.parentGraph = parentGraph
        this.parentGraph?.childGraphs.push(this)
        this.generations = new Generations(this)
        this.planes = new Planes(this)
        this.history = new PerspectiveHistory(this)
        this.startingSpace = startingSpace

        if (offAxis) {
            this.graphWidgetStyle.excludePerspectiveThing = true
            this.graphWidgetStyle.excludeCartesianAxes = true
        }
    }


    /* Basic informational methods. */

    /**
     * Get the Graph's Perspective Thing IDs.
     * @return {number[]} - An array of the Perspective Thing IDs.
     */
    get pThingIds(): number[] {
        return this._pThingIds
    }

    /**
     * Get the Graph's Depth (number of Generations the Graph should have).
     * @return {number} - The Graph's Depth.
     */
    get depth(): number {
        return this._depth
    }

    


    /* Basic setter methods. */

    /**
     * Set the Graph's Perspective Thing IDs.
     * @param  {number[]} pThingIDs - An array of the new Perspective Thing IDs to be set.
     */
    async setPThingIds(pThingIds: number[]): Promise<void> {
        this._pThingIds = pThingIds
        await this.build()
    }

    /**
     * Set the Graph's Depth.
     * @param  {number} depth - An array of the new Depth to be set.
     */
    async setDepth(depth: number): Promise<void> {
        this._depth = depth
        await this.generations.adjustToDepth(this._depth)
    }



    /**
     * Reset the Graph and build Generations up to its specified Depth.
     */
    async build(): Promise<void> {
        // Set (or reset) build attributes to their starting values.
        this.rootCohort = null
        this.generations.reset()
        this.planes.reset()
        this.formActive = false
        this.lifecycleStatus = "cleared"

        // Adjust (build) the Generations to the Graph's specified Depth.
        this.lifecycleStatus = "building"
        await this.generations.adjustToDepth(this._depth)

        // Add the starting Perspective Thing IDs to History.
        this.history.addEntries(this._pThingIds)
        
        this.lifecycleStatus = "built"
        await markThingsVisited(this.pThingIds)
    }


    async deleteThingById(thingId: number): Promise<void> {
        // Get the to-be-deleted Thing from the Store.
        const deletedThing = retrieveGraphConstructs<ThingDbModel>("Thing", thingId)
        if (deletedThing) {

            const thingDeleted = await deleteThing(thingId)
            if (thingDeleted) {
                // Get IDs of Stored Things related to the deleted Thing, and re-store them.
                const relatedThingIds = deletedThing.relatedThingIds.filter(id => !(id === null)) as number[]

                // Re-store any Things that were related to the deleted Thing (in order to
                // update their relations to reflect the deleted Thing's absence).
                await storeGraphConstructs<ThingDbModel>("Thing", relatedThingIds, true)

                // Remove the deleted Thing itself from the Store.
                await unstoreGraphConstructs("Thing", relatedThingIds)

                await this.build()
            }

        }
    }

    async deleteRelationshipByThingIds(sourceThingId: number, destThingId: number): Promise<void> {
        const relationshipDeleted = await deleteRelationship(sourceThingId, destThingId)
        if (relationshipDeleted) {
            // Re-store the Things that were related by the Relationship (in order to
            // update their relations to reflect the Relationship's absence).
            await storeGraphConstructs<ThingDbModel>("Thing", [sourceThingId, destThingId], true)

            await this.build()
        }

    }

    get pThingBaseWidgetModel(): ThingBaseWidgetModel | null {
        const pThingBaseWidgetModel = this.rootCohort?.members[0] || null
        return pThingBaseWidgetModel
    }
}