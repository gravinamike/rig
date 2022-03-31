import type { GraphWidgetStyle } from "$lib/shared/constants"
import type { Thing } from "$lib/models/dbModels"

import { defaultGraphWidgetStyle, cartesianHalfAxisIds } from "$lib/shared/constants"
import { storeGraphConstructs, graphConstructInStore, retrieveGraphConstructs, unstoreGraphConstructs } from "$lib/stores"
import { Generation, Cohort, Plane } from "$lib/models/graphModels"
import { ThingBaseWidgetModel, ThingWidgetModel, ThingPlaceholderWidgetModel } from "$lib/models/widgetModels"
import { deleteThing } from "$lib/db/clientSide/makeChanges"
import { unique } from "$lib/shared/utility"


/** Class representing a Graph. */
export class Graph {
    id: number
    _pThingIds: number[]
    _depth: number
    rootCohort: Cohort | null = null
    generations: Generation[] = []
    relationshipsOnlyGeneration: Generation | null = null
    planes: { [planeId: number]: Plane } = {}
    planeOffsets = [0, 0]
    focalPlaneId = 0
    graphWidgetStyle: GraphWidgetStyle = defaultGraphWidgetStyle
    perspectiveHistory: { timestamp: Date, thingId: number }[] = []
    thingIdToScrollTo: number | null = null
    allowScrollToThingId = false
    allowZoomAndScrollToFit = false
    formActive = false

    /**
     * Create a Graph.
     * @param {number[]} pThingIds - IDs for the Graph's starting Perspective Things.
     * @param {number}   depth     - How many Relationship "steps" to grow the Graph from the Perspective Things.
     */
    constructor(pThingIds: number[], depth: number) {
        this.id = 1
        this._pThingIds = pThingIds
        this._depth = depth
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
     * Get the Graph's Depth (number of Generations).
     * @return {number} - The Graph's Depth.
     */
    get depth(): number {
        return this._depth
    }

    /**
     * Get one of the Graph's Generations by ID.
     * @param  {number} generationId - The ID of the Generation to retrieve.
     * 
     * @return {Generation | null}   - The specified Generation (or null if it doesn't exist).
     */
    generationById( generationId: number ): Generation | null {
        const generation = 0 <= generationId && generationId < this.generations.length ? this.generations[generationId] : null
        return generation
    }

    /**
     * Get all of the Thing Widget Models in the Graph.
     * @return {ThingWidgetModel[]} - An array of the Graph's Thing Widget Models.
     */
    get thingWidgetModels(): ThingWidgetModel[] {
        const thingWidgetModels = this.generations.map(generation => generation.thingWidgetModels()).flat()
        return thingWidgetModels
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
        await this.adjustGenerationsToDepth()
    }


    /* Informational methods for building and stripping. */

    /**
     * Get the ID of the next Generation to be built.
     * @return {number} - The ID of the next Generation to be built.
     */
    get generationIdToBuild(): number {
        for (const generation of this.generations.slice().reverse()) {
            if (["new", "building"].includes(generation.lifecycleStatus)) return this.generations.indexOf(generation)
        }
        return this.generations.length
    }

    /**
     * Get the Thing Widget Models that would be the starting seeds of the next Generation to be built.
     * @return {ThingWidgetModel[]} - The next Generation's seed Thing Widget Models.
     */
    get seedThingWidgetModels(): ThingWidgetModel[] {
        if (!this.generations.length) {
            return []
        } else {
            const seedGeneration = this.generations[this.generations.length - 1]
            const seedThingWidgetModels = seedGeneration.thingWidgetModels()
            return seedThingWidgetModels
        }
        // Note for the future: When adding Perspective depth deltas, filter the
        // seedThingWidgetModels list based on depth deltas.
    }

    get thingIdsAlreadyInGraph(): number[] {
        return this.thingWidgetModels.map(model => model.thingId)
            .filter(thingId => thingId) as number[]
    }

    /**
     * Get the ID of the next Generation to be stripped.
     * @return {number} - The ID of the next Generation to be stripped.
     */
     get generationIdToStrip(): number {
        for (const generation of this.generations.slice().reverse()) {
            if (["built"].includes(generation.lifecycleStatus)) return this.generations.indexOf(generation)
        }
        return this.generations.length - 1
    }

    /**
     * Get the IDs of all the Things in a to-be-built Generation, by the Generation's ID.
     * @param  {number} generationId - The ID of the Generation to retrieve Thing IDs for.
     * 
     * @return {number} - The IDs of all the Things for the to-be-built Generation.
     */
    thingIdsForGenerationId(generationId: number): number[] {
        // For generation 0, start from the Perspective Thing IDs.
        // For generations >1, start from the IDs of the last generation's Relation Things.
        const thingIdsAndNullsForGenerationId = generationId === 0 ?
            this._pThingIds :
            unique(this.seedThingWidgetModels.map(thingWidgetModel => thingWidgetModel.relatedThingIds).flat())
        const thingIdsForGenerationId = thingIdsAndNullsForGenerationId.filter(id => !!id) as number[]
        return thingIdsForGenerationId
    }


    /* Methods for building/stripping the Graph. */

    /**
     * Reset the Graph and build Generations up to its specified Depth.
     */
    async build(): Promise<void> {
        // Set (or reset) build attributes to their starting values.
        this.rootCohort = null
        this.generations = []
        this.relationshipsOnlyGeneration = null
        this.planes = {}
        this.focalPlaneId = 0
        this.formActive = false

        // Adjust (build) the Generations to the Graph's specified Depth.
        await this.adjustGenerationsToDepth()

        // Add the starting Perspective Thing IDs to History.
        this.addEntriesToHistory(this._pThingIds)
    }

    /**
     * Either build or strip Generations as needed to bring the Graph to its specified Depth.
     */
    async adjustGenerationsToDepth(): Promise<void> {
        let difference = this.generations.length - (this._depth + 1)
        while (difference) {
            if (difference < 0) {
                await this.buildGeneration()
            } else {
                await this.stripGeneration()
            }
            difference = this.generations.length - (this._depth + 1)
        }
        this.buildRelationshipsOnlyGeneration()
    }

    /**
     * Build a new Generation onto the Graph.
     */
    async buildGeneration(): Promise<void> {
        // Store Things for new Generation.
        await this.storeNextGenerationThings()

        // Create a Thing Widget (or placeholder) Model for each Thing ID in the new Generation.
        const membersForGeneration = this.thingIdsForGenerationId(this.generationIdToBuild).map(
            id => {return (
                this.thingIdsAlreadyInGraph.includes(id) ? new ThingBaseWidgetModel(id, this) : // If the Thing is already modeled in the Graph, return a spacer model.
                graphConstructInStore("Thing", id) ? new ThingWidgetModel(id, this) :      // Else, if the Thing is in the Thing store, create a new model for that Thing ID.
                new ThingPlaceholderWidgetModel(id)                                        // Otherwise, create a placeholder.
            )}
        )

        // Add the new, empty Generation.
        const newGeneration = new Generation(this, this.generationIdToBuild)
        this.generations.push(newGeneration)

        // Build the Generation.
        newGeneration.build(membersForGeneration)
        console.log("NEW GENERATION", newGeneration)
    }





    
     async buildRelationshipsOnlyGeneration(): Promise<void> {
        const generationIdToBuild = this.generations.length

        const membersForGeneration = this.thingIdsForGenerationId(generationIdToBuild)
            .filter(id => this.thingIdsAlreadyInGraph.includes(id))
            .map(id => new ThingBaseWidgetModel(id, this))

        // Add the new, empty Generation as the Relationships-only Generation.
        const newGeneration = new Generation(this, generationIdToBuild)
        this.relationshipsOnlyGeneration = newGeneration

        // Build the Generation.
        newGeneration.build(membersForGeneration)
    }












    /**
     * Add the Things required for the next Generation to the application's Thing Store.
     */
    async storeNextGenerationThings(): Promise<void> {
        // Filter out Thing IDs already represented in the Graph (to avoid recursion).
        const thingIdsOfGraph = this.thingWidgetModels.map(thingWidgetModel => thingWidgetModel.thingId)
        const thingIdsToStore = this.thingIdsForGenerationId(this.generationIdToBuild).filter( id => !thingIdsOfGraph.includes(id) )

        // Store Things from the IDs.
        const storedThings = await storeGraphConstructs<Thing>("Thing", thingIdsToStore)
        const storedThingsById: { [thingId: number]: Thing } = {}
        storedThings.forEach(
            storedThing => storedThingsById[storedThing.id] = storedThing
        )
    }

    /**
     * Add a Cohort to the Graph's Planes by ID (creating the Plane if necessary).
     * @param {Cohort} cohort - The Cohort which will be added to the Plane.
     * @param {number} planeId - The ID of the Plane to which the Cohort will be added.
     */
    addCohortToPlane( cohort: Cohort, planeId: number ): void {
        if (!(planeId in this.planes)) this.planes[planeId] = new Plane(planeId, this)
        this.planes[planeId].addCohort(cohort)
    }

    /**
     * Add one or multiple Thing IDs to the Graph's Perspective History.
     * @param  {number | number[]} thingIds - The Thing ID or IDs to add to the History.
     */
    addEntriesToHistory( thingIds: number | number[] ): void {
        if (typeof thingIds === "number") thingIds = [thingIds]
        const timestamp = new Date()
        const entries = thingIds.map(
            (thingId) => { return { timestamp: timestamp, thingId: thingId } }
        )
        this.perspectiveHistory.push(...entries)
    }

    /**
     * Strip the most recent Generation from the Graph.
     */
    async stripGeneration(): Promise<void> {
        const generationToStrip = this.generationById(this.generationIdToStrip)

        if (!generationToStrip) {
            return
        } else {
            // Mark the Generation as stripping.
            generationToStrip.lifecycleStatus = "stripping"

            // For each ThingWidgetModel of the parent Generation,
            for (const thingWidgetModel of generationToStrip.parentGeneration?.thingWidgetModels() || []) {
                // For each Cohort of that ThingWidgetModel's cohorts,
                for (const cohort of thingWidgetModel.childCohorts) {
                    // Clear the Cohort's members.
                    cohort.members = []
                    // Remove the Cohort from its Generation and its Plane.
                    cohort.removeFromGroups()
                }
                // Clear the ThingWidgetModel's cohorts attribute.
                thingWidgetModel.childCohortsByHalfAxisId = {}
            }
            // Remove the Generation from the graph.
            const index = this.generations.indexOf(generationToStrip)
            if (index > -1) this.generations.splice(index, 1)

            // Mark the Generation as stripped.
            generationToStrip.lifecycleStatus = "stripped"
        }     
    }

    async deleteThingById(thingId: number): Promise<void> {
        // Get the to-be-deleted Thing from the Store.
        const deletedThing = retrieveGraphConstructs<Thing>("Thing", thingId)
        if (deletedThing) {

            const thingDeleted = await deleteThing(thingId)
            if (thingDeleted) {
                // Get IDs of Stored Things related to the deleted Thing, and re-store them.
                const relatedThingIds = deletedThing.relatedThingIds.filter(id => !(id === null)) as number[]

                // Re-store any Things that were related to the deleted Thing (in order to
                // update their relations to reflect the deleted Thing's absence).
                await storeGraphConstructs<Thing>("Thing", relatedThingIds, true)

                // Remove the deleted Thing itself from the Store.
                await unstoreGraphConstructs("Thing", relatedThingIds)

                await this.build()
            }

        }
    }
}