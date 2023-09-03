// Import types.
import type { ThingDbModel } from "$lib/models/dbModels"
import type { Thing } from "$lib/models/constructModels"

// Import basic framework resources.
import { get } from "svelte/store"

// Import stores.
import { buildMethod, storeGraphDbModels } from "$lib/stores"

// Import utility functions.
import { makeArrayUnique } from "$lib/shared/utility"

// Import Graph construct models.
import { Graph, Generation } from "$lib/models/constructModels"



/**
 * Generations class.
 * 
 * Represents a collection of a Graph's Generations, meaning sets of Things
 * that are added step-wise to the Graph as it is built out from the
 * Perspective Thing.
 */
export class Generations {
    // The Graph that these Generations belong to.
    #graph: Graph

    // The member Generations of this Generations object.
    #members: Generation[] = []

    // The Relationships-only Generation (the last Generation of the set, which
    // contains no Things, but only Relationships between existing Things).
    #relationshipsOnlyMember: Generation | null = null

    
    /**
     * Generations constructor.
     * 
     * Creates the set of Generations belonging to a Graph.
     * @param {Graph} graph - The Graph the Generations belong to.
     */
    constructor(graph: Graph) {
        this.#graph = graph
    }


    /* Basic getters and setters. */

    /**
     * Generations-as-array getter.
     * 
     * Gets the Generations as an array (as an attribute of Generations).
     */
    get asArray(): Generation[] {
        return this.#members
    }

    /**
     * Generation-by-ID method.
     * 
     * Get one of the Generations by ID. (Its ID is equal to its index in
     * this.#members).
     * @param generationId - The ID (index) of the Generation to retrieve.
     * @returns - The specified Generation (or null if it doesn't exist).
     */
    byId( generationId: number ): Generation | null {
        const generation =
            ( 0 <= generationId && generationId < this.#members.length ) ? this.#members[generationId] :
            null
        return generation
    }

    /**
     * Relationships-only-Generation getter.
     * 
     * Retrieves the Relationships-only-Generation as an attribute.
     * @returns - The Relationships-only Generation (or null if it hasn't been created yet).
     */
    get relationshipsOnlyGeneration(): Generation | null {
        return this.#relationshipsOnlyMember
    }

    /**
     * Relationships-only-Generation setter.
     * 
     * Sets the Relationships-only Generation as an attribute.
     */
    set relationshipsOnlyGeneration(generation: Generation | null) {
        this.#relationshipsOnlyMember = generation
    }

    /**
     * Reset-Generations method.
     * 
     * Resets the Generations to their initial, empty state.
     */
    reset(): void {
        this.#members = []
        this.#relationshipsOnlyMember = null
    }


    /* Methods to access information for building/stripping the Generations. */

    /**
     * Generation-ID-to-build getter.
     * 
     * Gets the ID of the next Generation to be built, as an attribute.
     * @returns - The ID of the next Generation to be built.
     */
    get idToBuild(): number {
        // Go through the Generations in reverse, from latest to earliest. For
        // each one,
        const reversedGenerations = this.#members.slice().reverse()
        for (const generation of reversedGenerations) {
            // If the Generation is in the "new" or "building" lifecycle
            // stages, return it (it's the Generation to build).
            if (["new", "building"].includes(generation.lifecycleStatus)) {
                return this.#members.indexOf(generation)
            }
        }

        // If no Generation was found in the "new" or "building" lifecycle
        // stages, then return the ID (index) of the as-yet-unbuilt next
        // Generation.
        return this.#members.length
    }

    /**
     * Generation-ID-to-strip getter.
     * 
     * Gets the ID of the next Generation to be stripped, as an attribute.
     * @returns - The ID of the next Generation to be stripped.
     */
    get idToStrip(): number {
        // Go through the Generations in reverse, from latest to earliest. For
        // each one,
        const reversedGenerations = this.#members.slice().reverse()
        for (const generation of reversedGenerations) {
            // If the Generation is in the "built" lifecycle stage, return it
            // (it's the Generation to strip).
            if (["built"].includes(generation.lifecycleStatus)) {
                return this.#members.indexOf(generation)
            }
        }

        // If no Generation was found in the "built" lifecycle stage, then
        // return the ID (index) of the latest Generation.
        return this.#members.length - 1
    }

    /**
     * Seed-Generation getter.
     * 
     * Gets the "seed" Generation, which supplies the Things from which the
     * next Generation is built, as an attribute. (In practice, the seed
     * Generation is the last Generation in the set of Generations.)
     * @returns - The seed Generation (or null if there are no Generations).
     */
    get seedGeneration(): Generation | null {
        const seedGeneration =
            this.#members.length ? this.#members[this.#members.length - 1] :
            null
        return seedGeneration
    }

    /**
     * Seed-Generation-Things getter.
     * 
     * Gets an array of the Things that belong to the seed Generation, as an
     * attribute.
     * @returns - An array of the Things that belong to the seed Generation.
     */
    get seedGenerationThings(): Thing[] {
        return this.seedGeneration?.things(false) || [] // Note for the future: When adding Perspective depth deltas, filter the seedThings list based on depth deltas.
    }

    /**
     * Seed-Generation-related-Thing-IDs getter.
     * 
     * Gets an array of IDs for all Things that are related to the Things in
     * the seed Generation, as an attribute.
     * @returns - An array of IDs for all Things that are related to the Things in the seed Generation.
     */
    get seedGenerationRelatedThingIds(): number[] {
        // Get an array of Things that are related to the Things in the seed
        // Generation.
        const seedGenerationRelatedThingIdsAndNulls = makeArrayUnique(
            this.seedGenerationThings.map(thing => thing.relatedThingIds).flat()
        )
        
        // Get an array of IDs for those Things.
        const seedGenerationRelatedThingIds = seedGenerationRelatedThingIdsAndNulls.filter(id => !!id) as number[]

        // Return that array.
        return seedGenerationRelatedThingIds
    }
    
    /**
     * New-Generation-Thing-IDs method.
     * 
     * Gets an array of IDs of all the Things in the to-be-built Generation.
     * @returns - An array of IDs of all the Things for the to-be-built Generation.
     */
    newGenerationThingIds(): number[] {
        // Get an array of the new Generation Thing IDs.
        const newGenerationThingIds =
            // For generation 0, start from the Perspective Thing IDs.
            this.idToBuild === 0 ? this.#graph.pThingIds :
            // For generations 1 and above, start from the IDs of the last
            // generation's Relation Things.
            this.seedGenerationRelatedThingIds

        // Return that array.
        return newGenerationThingIds
    }
    
    /**
     * Things getter.
     * 
     * Gets an array of all the Graph's Things across all Generations, as an
     * attribute.
     * @return - An array of all the Graph's Things.
     */
    get things(): Thing[] {
        return this.#members.map(member => member.things()).flat()
    }


    /* Methods for building/stripping Generations. */

    /**
     * Store-next-Generation-Thing-DB-models method.
     * 
     * Adds the Thing database models required for the next Generation to the
     * application's Thing Store.
     */
    async storeNextGenerationThingDbModels(): Promise<void> {
        // Get an array of Thing IDs to be stored. These correspond to the
        // new Generation Thing IDs, with any Thing IDs already represented in
        // in the Graph filtered out (to avoid recursion).
        const thingIdsOfGraph = this.things.map(thing => thing.id)
        const thingIdsToStore = this.newGenerationThingIds().filter( id => !thingIdsOfGraph.includes(id) )

        // Store ThingDBModels from these IDs.
        await storeGraphDbModels<ThingDbModel>("Thing", thingIdsToStore)
    }

    /**
     * Build-Generation method.
     * 
     * Builds a new Generation onto the graph. (This includes both
     * Relationships and Things, so is not to be used for the last,
     * Relationships-only Generation.)
     */
    async buildGeneration(): Promise<void> {
        // Create the new, empty Generation.
        const newGeneration = new Generation(this.idToBuild, this.#graph)
        console.log("BUILDING GEN", this.idToBuild)
        // Store the Thing database models for the new Generation.
        await this.storeNextGenerationThingDbModels()

        // Get the IDs of the Things for the new Generation.
        const thingIdsForGeneration = this.newGenerationThingIds()

        // Add the new Generation to the Generations object.
        this.#members.push(newGeneration)

        // Build the new Generation using its Thing IDs.
        await newGeneration.build(thingIdsForGeneration)
    }

    /**
     * Build-Relationships-only-Generation method.
     * 
     * Builds the last, Relationships-only Generation onto the Graph.
     */
    async buildRelationshipsOnlyGeneration(): Promise<void> {
        // Get the ID of the to-be-built Relationships-only Generation.
        const generationIdToBuild = this.#members.length

        // Create the new, empty Generation and add it to the Generations
        // object as the Relationships-only Generation.
        const newGeneration = new Generation(generationIdToBuild, this.#graph)
        newGeneration.isRelationshipsOnly = true
        this.#relationshipsOnlyMember = newGeneration

        // Get the IDs of the Things for the new Generation, and then build the
        // Generation using those IDs.
        const memberIdsForGeneration =
            this.newGenerationThingIds()
                .filter( id => this.#graph.thingIdsAlreadyInGraph.includes(id) )
        await newGeneration.build(memberIdsForGeneration)
    }

    /**
     * Strip-Generation method.
     * 
     * Strip the most recent Generation from the Graph.
     */
    async stripGeneration(): Promise<void> {
        // Get the ID of the Generation to strip. If there is none, abort.
        const generationToStrip = this.byId(this.idToStrip)
        if (!generationToStrip) return

        // Mark the Generation as in the process of stripping.
        generationToStrip.lifecycleStatus = "stripping"

        // For each Thing of the parent Generation,
        for (const thing of generationToStrip.parentGeneration?.things() || []) {
            // For each Thing Cohort of that Thing's child Thing Cohorts,
            for (const cohort of thing.childThingCohorts) {
                // Clear the Thing Cohort's members.
                cohort.members = []
                // Remove the Cohort from its Generation and its Plane.
                cohort.removeFromGroups()
            }
        }

        // Remove the Generation from the graph.
        const index = this.#members.indexOf(generationToStrip)
        if (index > -1) this.#members.splice(index, 1)

        // Mark the Generation as stripped.
        generationToStrip.lifecycleStatus = "stripped"
    }

    
    




    async stripGridLayer(): Promise<void> {

        


        // Get the ID of the Generation to strip. If there is none, abort.
        const generationToStrip = this.byId(this.idToStrip)
        if (!generationToStrip) return

        // Mark the Generation as in the process of stripping.
        generationToStrip.lifecycleStatus = "stripping"

        // For each Thing of the parent Generation,
        for (const thing of generationToStrip.parentGeneration?.things() || []) {
            // For each Thing Cohort of that Thing's child Thing Cohorts,
            for (const cohort of thing.childThingCohorts) {
                // Clear the Thing Cohort's members.
                cohort.members = []
                // Remove the Cohort from its Generation and its Plane.
                cohort.removeFromGroups()
            }
        }

        // Remove the Generation from the graph.
        const index = this.#members.indexOf(generationToStrip)
        if (index > -1) this.#members.splice(index, 1)

        // Mark the Generation as stripped.
        generationToStrip.lifecycleStatus = "stripped"
    }









    /**
     * Adjust-Generations-to-Graph-depth method.
     * 
     * Either build or strip Generations as needed to bring the Graph to its specified depth.
     */
    async adjustToDepth(depth: number): Promise<void> {
        // While the the difference between the Graph's current depth and its
        // specified depth still exists, correct it.
        console.log(" ")
        console.log("ADJUSTING TO DEPTH ========================================================")
        while (this.needAdjustment(depth) && this.#members.length < 5) {
            console.log(" ")
            console.log("SEED GEN IS", this.seedGeneration?.id, "WITH", this.seedGenerationThings.length, "SEED THINGS")

            const buildOrStrip = this.needBuildOrStrip(depth)

            if (buildOrStrip === "build") await this.buildGeneration()
            else await this.stripGeneration()
        }

        // Once the actual number of Generations is equal to the specified
        // number, build (or re-build) the Relationships-only Generation.
        this.buildRelationshipsOnlyGeneration()
    }








    needAdjustment(depth: number) {

        // Get the difference between the Graph's current depth and its
        // specified depth.
        const difference = this.#members.length - (depth + 1)

        if (
        
            // ...the build mode is "radial" and there is still a difference between the specified
            // and actual number of Generations, or...
            (
                get(buildMethod) === "radial"
                && difference
            )

            // ...the build mode is "grid" and either Generation 0 is being built or the previous,
            // "seed" Generation contains Things to build from,
            || (
                get(buildMethod) === "grid"
                && (
                    this.#members.length === 0
                    || this.seedGenerationThings.length > 0
                )
            )

        ) {
            return true
        } else {
            return false
        }
    }





    needBuildOrStrip(depth: number) {

        // Get the difference between the Graph's current depth and its
        // specified depth.
        const difference = this.#members.length - (depth + 1)

        // If there are fewer Generations than specified, build a new
        // Generation.
        if (
            (
                get(buildMethod) === "radial"
                && difference < 0
            )
            || (
                get(buildMethod) === "grid"
                && (
                    this.#members.length === 0
                    || this.seedGenerationThings.length > 0
                )
            )
        ) {
            return "build"

        // If there are more Generations than specified, strip a
        // Generation.
        } else if (
            get(buildMethod) === "radial"
            || get(buildMethod) === "grid"
        ) {
            return "strip"
        }


    }

    





}