// Type imports.
import type { Thing } from "$lib/models/constructModels"

// Store imports.
import { storeGraphDbModels } from "$lib/stores"

// Utility imports.
import { unique } from "$lib/shared/utility"

// Model imports.
import { Graph, Generation } from "$lib/models/constructModels"
import type { ThingDbModel } from "$lib/models/dbModels"


/** Class representing the set of Generations belonging to a Graph. */
export class Generations {
    _graph: Graph
    _members: Generation[] = []
    _relationshipsOnlyMember: Generation | null = null

    /**
     * Create the set of Generations belonging to a Graph.
     * @param {Graph} graph - The Graph the Generations belong to.
     */
    constructor(graph: Graph) {
        this._graph = graph
    }


    /* Methods to access or set major features of the Generations. */

    /**
     * Get the Generations as an array.
     */
    get asArray(): Generation[] {
        return this._members
    }

    /**
     * Get one of the Generations by ID. (ID is equal to the index.)
     * @param  {number} generationId - The ID of the Generation to retrieve.
     * 
     * @return {Generation | null}   - The specified Generation (or null if it doesn't exist).
     */
    byId( generationId: number ): Generation | null {
        return 0 <= generationId && generationId < this._members.length ?
            this._members[generationId] :
            null
    }

    /**
     * Get the final, Relationships-only Generation if it has been built.
     */
    get relationshipsOnlyGeneration(): Generation | null {
        return this._relationshipsOnlyMember
    }

    /**
     * Set the final, Relationships-only Generation if it has been built.
     */
    set relationshipsOnlyGeneration(generation: Generation | null) {
        this._relationshipsOnlyMember = generation
    }


    /* Methods to Set major features of the Generations.

    /**
     * Reset the Generations to their initial, empty state.
     */
    reset(): void {
        this._members = []
        this._relationshipsOnlyMember = null
    }


    /* Methods to access information for building/stripping the Generations. */

    /**
     * Get the ID of the next Generation to be built.
     * @return {number} - The ID of the next Generation to be built.
     */
    get idToBuild(): number {
        const reversedGenerations = this._members.slice().reverse()
        for (const generation of reversedGenerations) {
            if (["new", "building"].includes(generation.lifecycleStatus)) return this._members.indexOf(generation)
        }
        return this._members.length
    }

    /**
     * Get the ID of the next Generation to be stripped.
     * @return {number} - The ID of the next Generation to be stripped.
     */
    get idToStrip(): number {
        const reversedGenerations = this._members.slice().reverse()
        for (const generation of reversedGenerations) {
            if (["built"].includes(generation.lifecycleStatus)) return this._members.indexOf(generation)
        }
        return this._members.length - 1
    }

    /**
     * Get the "seed" Generation, which supplies the Things from which the next Generation is built.
     * In practice, the seed Generation is the last Generation in the set of Generations.
     * @return {Generation | null} - The seed Generation (or null if there are no Generations).
     */
    get seedGeneration(): Generation | null {
        return this._members.length ?
            this._members[this._members.length - 1] :
            null
    }

    get seedGenerationThings(): Thing[] {
        return this.seedGeneration?.things() || [] // Note for the future: When adding Perspective depth deltas, filter the seedThings list based on depth deltas.
    }

    get seedGenerationRelatedThingIds(): number[] {
        const seedGenerationRelatedThingIdsAndNulls = unique(this.seedGenerationThings.map(thingWidgetModel => thingWidgetModel.relatedThingIds).flat())
        const seedGenerationRelatedThingIds = seedGenerationRelatedThingIdsAndNulls.filter(id => !!id) as number[]
        return seedGenerationRelatedThingIds
    }
    

    /**
     * Get the IDs of all the Things in a to-be-built Generation, by the Generation's ID.
     * 
     * @return {number} - The IDs of all the Things for the to-be-built Generation.
     */
    newGenerationThingIds(): number[] {

        return this.idToBuild === 0 ?
            // For generation 0, start from the Perspective Thing IDs.
            this._graph.pThingIds :
            // For generations > 1, start from the IDs of the last generation's Relation Things.
            this.seedGenerationRelatedThingIds
    }
    

    /**
     * Get all of the Things across the Generations.
     * @return {Thing[]} - An array of the Graph's Thingss.
     */
    get things(): Thing[] {
        return this._members.map(member => member.things()).flat()
    }


    /* Methods for building/stripping Generations. */

    /**
     * Add the Things required for the next Generation to the application's Thing Store.
     */
    async storeNextGenerationThings(): Promise<void> {
        // Filter out Thing IDs already represented in the Graph (to avoid recursion).
        const thingIdsOfGraph = this.things.map(thing => thing.id)
        const thingIdsToStore = this.newGenerationThingIds().filter( id => !thingIdsOfGraph.includes(id) )

        // Store Things from the IDs.
        await storeGraphDbModels<ThingDbModel>("Thing", thingIdsToStore)
    }

    /**
     * Build a new Generation onto the Graph.
     */
    async buildGeneration(): Promise<void> {
        // Store Things for new Generation.
        await this.storeNextGenerationThings()

        // Create a Thing Widget (or placeholder) Model for each Thing ID in the new Generation.
        const memberIdsForGeneration = this.newGenerationThingIds()

        // Create the new Generation and add it to the Generations.
        const newGeneration = new Generation(this._graph, this.idToBuild)
        this._members.push(newGeneration)

        // Build the new Generation.
        await newGeneration.build(memberIdsForGeneration)
    }

    /**
     * Strip the most recent Generation from the Graph.
     */
    async stripGeneration(): Promise<void> {
        const generationToStrip = this.byId(this.idToStrip)

        if (!generationToStrip) {
            return
        } else {
            // Mark the Generation as stripping.
            generationToStrip.lifecycleStatus = "stripping"

            // For each ThingWidgetModel of the parent Generation,
            for (const thing of generationToStrip.parentGeneration?.things() || []) {
                // For each Cohort of that ThingWidgetModel's cohorts,
                for (const cohort of thing.childThingCohorts) {
                    // Clear the Cohort's members.
                    cohort.members = []
                    // Remove the Cohort from its Generation and its Plane.
                    cohort.removeFromGroups()
                }
            }
            // Remove the Generation from the graph.
            const index = this._members.indexOf(generationToStrip)
            if (index > -1) this._members.splice(index, 1)

            // Mark the Generation as stripped.
            generationToStrip.lifecycleStatus = "stripped"
        }     
    }

    async buildRelationshipsOnlyGeneration(): Promise<void> {
        const generationIdToBuild = this._members.length

        const memberIdsForGeneration = this.newGenerationThingIds()
            .filter(id => this._graph.thingIdsAlreadyInGraph.includes(id))

        // Add the new, empty Generation as the Relationships-only Generation.
        const newGeneration = new Generation(this._graph, generationIdToBuild)
        newGeneration.isRelationshipsOnly = true
        this._relationshipsOnlyMember = newGeneration

        // Build the Generation.
        await newGeneration.build(memberIdsForGeneration)
    }

    /**
     * Either build or strip Generations as needed to bring the Graph to its specified Depth.
     */
    async adjustToDepth(depth: number): Promise<void> {
        let difference = this._members.length - (depth + 1)
        while (difference) {
            if (difference < 0) {
                await this.buildGeneration()
            } else {
                await this.stripGeneration()
            }
            difference = this._members.length - (depth + 1)
        }
        this.buildRelationshipsOnlyGeneration()
    }
}