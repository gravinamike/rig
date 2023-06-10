import type { Space, Thing, ThingCohort } from "$lib/models/constructModels"

import { storeGraphDbModels, getGraphConstructs, unstoreGraphDbModels, perspectiveSpaceIdStore } from "$lib/stores"
import { Generations } from "./generations"
import { Planes } from "./planes"
import { PerspectiveHistory } from "./history"
import { deleteThing, deleteRelationship } from "$lib/db/makeChanges"
import type { ThingDbModel } from "$lib/models/dbModels"
import { updateUrlHash } from "$lib/shared/utility"


/** Class representing a Graph. */
export class Graph {
    id: number
    _pThingIds: number[]
    _depth: number
    parentGraph: Graph | null
    childGraphs: Graph[] = []
    rootCohort: ThingCohort | null = null
    pThing: Thing | null = null
    generations: Generations
    planes: Planes
    history: PerspectiveHistory
    lifecycleStatus: "new" | "building" | "built" | "cleared" = "new"
    startingSpace: Space | null
    originalStartingSpace: Space | null
    offAxis: boolean
    inSearchMenu: boolean
    formActive: boolean

    /**
     * Create a Graph.
     * @param {number[]} pThingIds - IDs for the Graph's starting Perspective Things.
     * @param {number}   depth     - How many Relationship "steps" to grow the Graph from the Perspective Things.
     */
    constructor(id: number, pThingIds: number[], depth: number, parentGraph: (Graph | null)=null, offAxis=false, inSearchMenu=false, startingSpace: (Space | null)=null) {
        this.id = id
        this._pThingIds = pThingIds
        this._depth = depth
        this.parentGraph = parentGraph
        this.parentGraph?.childGraphs.push(this)
        this.generations = new Generations(this)
        this.planes = new Planes(this)
        this.history = new PerspectiveHistory()
        this.startingSpace = startingSpace
        this.originalStartingSpace = startingSpace
        this.offAxis = offAxis
        this.inSearchMenu = inSearchMenu
        this.formActive = false
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
     * @param  {number[]} pThingIds - An array of the new Perspective Thing IDs to be set.
     */
    async setPThingIds(pThingIds: number[], updateHistory=true): Promise<void> {
        this._pThingIds = pThingIds
        await this.build(false, updateHistory)
    }

    async setSpace(space: Space): Promise<void> {
        this.startingSpace = space
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
    async build(keepCurrentSpace=true, updateHistory=true): Promise<void> {
        // Set (or reset) build attributes to their starting values.
        this.rootCohort = null
        this.generations.reset()
        this.planes.reset()
        if (!keepCurrentSpace) this.startingSpace = this.originalStartingSpace
        this.formActive = false
        this.lifecycleStatus = "cleared"

        // Adjust (build) the Generations to the Graph's specified Depth.
        this.lifecycleStatus = "building"
        await this.generations.adjustToDepth(this._depth)
        this.pThing = (this.rootCohort as unknown as ThingCohort).members[0].thing
        
        if (!(this.parentGraph || this.inSearchMenu)) {
            const pThingSpaceId = this.pThing?.space?.id || null
            perspectiveSpaceIdStore.set(pThingSpaceId)
            updateUrlHash({
                spaceId: String(pThingSpaceId)
            })
        }
        
        // Add the starting Perspective Thing IDs to History.
        if (updateHistory) {
            await this.history.addEntries(this._pThingIds)
        }
        
        this.lifecycleStatus = "built"
    }

    async deleteThingById(thingId: number): Promise<void> {
        // Get the to-be-deleted Thing from the Store.
        const deletedThing = getGraphConstructs<Thing>("Thing", thingId)
        if (deletedThing) {

            const thingDeleted = await deleteThing(thingId)
            if (thingDeleted) {
                // Get IDs of Stored Things related to the deleted Thing, and re-store them.
                const relatedThingIds = deletedThing.relatedThingIds.filter(id => !(id === null)) as number[]

                // Re-store any Things that were related to the deleted Thing (in order to
                // update their relations to reflect the deleted Thing's absence).
                await storeGraphDbModels<ThingDbModel>("Thing", relatedThingIds, true)

                // Remove the deleted Thing itself from the Store.
                await unstoreGraphDbModels("Thing", relatedThingIds)

                await this.build()
            }

        }
    }

    async deleteRelationshipByThingIds(sourceThingId: number, destThingId: number): Promise<void> {
        const relationshipDeleted = await deleteRelationship(sourceThingId, destThingId)
        if (relationshipDeleted) {
            // Re-store the Things that were related by the Relationship (in order to
            // update their relations to reflect the Relationship's absence).
            await storeGraphDbModels<ThingDbModel>("Thing", [sourceThingId, destThingId], true)

            await this.build()
        }

    }

    async refreshPThing(): Promise<void> {

        const pThingCohortMember = this.rootCohort?.members[0]
        if (!pThingCohortMember?.thingId) return

        await storeGraphDbModels<ThingDbModel>("Thing", pThingCohortMember.thingId, true)
        pThingCohortMember.thing = getGraphConstructs<Thing>("Thing", pThingCohortMember.thingId)
        this.rootCohort?.members.shift()
        this.rootCohort?.addMember(pThingCohortMember)
        this.pThing = pThingCohortMember.thing

    }

    /**
     * Get the IDs of all of the Things already rendered in the Graph.
     * @return {number[]} - An array of Thing IDs already rendered in the Graph.
     */
    get thingIdsAlreadyInGraph(): number[] {
        return this.generations.things.map(thing => thing.id).filter(thingId => thingId) as number[]
    }
}