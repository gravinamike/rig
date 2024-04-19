// Import types.
import type { ThingDbModel } from "$lib/models/dbModels"
import type { Thing } from "$lib/models/constructModels"

// Import stores.
import { storeGraphDbModels } from "$lib/stores"

// Import utility functions.
import { removeItemFromArray, makeArrayUnique } from "$lib/shared/utility"

// Import Graph construct models.
import { Graph, Generation } from "$lib/models/constructModels"



/**
 * Generations class.
 * 
 * Represents the collection of a Graph's Generations, meaning sets of Things that are added step-
 * wise to the Graph as it is built out from the Perspective Thing.
 */
export class Generations {
    // The Graph that these Generations belong to.
    #graph: Graph

    // The member Generations of this Generations object.
    #members: Generation[] = []

    // The Relationships-only Generation (the last Generation of the set, which contains no Things,
    // only Relationships between existing Things).
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
     * Gets the Generations as an array (and as an attribute).
     */
    get asArray(): Generation[] {
        return this.#members
    }

    /**
     * Generation-by-ID method.
     * 
     * Get one of the Generations by ID. (The ID is equal to its index in this.#members).
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
     * Generations-need-build method.
     * 
     * Determines whether the Generations need to be built or not, as an attribute.
     * @returns - Whether to build the Generations or not.
     */
    get needBuild() {
        // If...
        if (
            // The Graph does not yet have a Perspective Thing, or...
            !this.#graph.pThing

            // ...the build mode is "radial" there are fewer Generations than specified, or...
            ||(
                this.#graph.pThing?.space?.buildmethod === "radial"
                && (
                    this.#members.length === 0
                    || this.seedGenerationThings.length > 0
                )
            )

            // ...the build mode is "grid" and either Generation 0 is being built or the previous,
            // "seed" Generation contains Things to build from,
            || (
                this.#graph.pThing?.space?.buildmethod === "grid"
                && (
                    this.#members.length === 0
                    || this.seedGenerationThings.length > 0
                )
            )

        // ...build a new Generation.
        ) {
            return true

        // Otherwise, don't build a new Generation.
        } else {
            return false
        }
    }

    /**
     * Generation-ID-to-build getter.
     * 
     * Gets the ID of the next Generation to be built, as an attribute.
     * @returns - The ID of the next Generation to be built.
     */
    get generationIdToBuild(): number {
        // Go through the Generations in reverse, from latest to earliest.
        const reversedGenerations = this.#members.slice().reverse()

        // For each one,
        for (const generation of reversedGenerations) {
            // If the Generation is in the "new" or "building" lifecycle stages, return it (it's
            // the Generation to build).
            if (["new", "building"].includes(generation.lifecycleStatus)) {
                return this.#members.indexOf(generation)
            }
        }

        // If no Generation was found in the "new" or "building" lifecycle stages, then return the
        // ID (index) of the as-yet-unbuilt next Generation.
        return this.#members.length
    }

    /**
     * Generation-ID-to-strip getter.
     * 
     * Gets the ID of the next Generation to be stripped, as an attribute.
     * @returns - The ID of the next Generation to be stripped.
     */
    get generationIdToStrip(): number {
        // Go through the Generations in reverse, from latest to earliest.
        const reversedGenerations = this.#members.slice().reverse()

        // For each one,
        for (const generation of reversedGenerations) {
            // If the Generation is in the "built" lifecycle stage, return it (it's the Generation
            // to strip).
            if (["built"].includes(generation.lifecycleStatus)) {
                return this.#members.indexOf(generation)
            }
        }

        // If no Generation was found in the "built" lifecycle stage, then return the ID (index) of
        // the latest Generation.
        return this.#members.length - 1
    }

    /**
     * Seed-Generation getter.
     * 
     * Gets the "seed" Generation, which supplies the Things from which the next Generation is
     * built, as an attribute. (In practice, the seed Generation is the last Generation in the set
     * of Generations.)
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
     * Gets an array of the Things that belong to the seed Generation, as an attribute.
     * @returns - An array of the Things that belong to the seed Generation.
     */
    get seedGenerationThings(): Thing[] {
        return this.seedGeneration?.things() || []
    }

    /**
     * Seed-Generation-related-Thing-IDs getter.
     * 
     * Gets an array of IDs for all Things that are related to the Things in the seed Generation,
     * as an attribute.
     * @returns - An array of IDs for all Things that are related to the Things in the seed Generation.
     */
    get seedGenerationRelatedThingIds(): number[] {
        // Get an array of Things that are related to the Things in the seed Generation.
        const seedGenerationRelatedThingIdsAndNulls = makeArrayUnique(
            this.seedGenerationThings.map(thing => thing.relatedThingIds).flat()
        )
        
        // Get an array of IDs for those Things.
        const seedGenerationRelatedThingIds = seedGenerationRelatedThingIdsAndNulls.filter(id => !!id) as number[]

        // Return that array.
        return seedGenerationRelatedThingIds
    }
    
    /**
     * New-Generation-Thing-IDs getter.
     * 
     * Gets an array of IDs of all the Things in the to-be-built Generation, as an attribute.
     * @returns - An array of IDs of all the Things for the to-be-built Generation.
     */
    get newGenerationThingIds(): number[] {
        // Get an array of the new Generation Thing IDs.
        const newGenerationThingIds =
            // For generation 0, start from the Perspective Thing IDs.
            this.generationIdToBuild === 0 ? this.#graph.pThingIds :
            // For generations 1 and above, start from the IDs of the last
            // generation's Relation Things.
            this.seedGenerationRelatedThingIds

        // Return that array.
        return newGenerationThingIds
    }

    /**
     * New-Generation-Thing-IDs-to-store getter.
     * 
     * Gets an array of IDs of Things required for the next Generation, to be stored in the Thing
     * Store (which means excluding any Thing IDs which are already in the Graph, to avoid
     * recursion).
     */
    get nextGenerationThingIdsToStore(): number[] {
        // Get an array of Thing IDs to be stored. These correspond to the new Generation Thing
        // IDs, with any Thing IDs already represented in in the Graph filtered out.
        const thingIdsOfGraph = this.things.map(thing => thing.id)
        const thingIdsToStore = this.newGenerationThingIds.filter( id => !thingIdsOfGraph.includes(id) )

        // Return the array.
        return thingIdsToStore
    }
    
    /**
     * Things getter.
     * 
     * Gets an array of all the Graph's Things across all Generations, as an attribute.
     * @return - An array of all the Graph's Things.
     */
    get things(): Thing[] {
        return this.#members.map(member => member.things()).flat()
    }


    /* Methods for building/stripping Generations. */

    /**
     * Build-Generation method.
     * 
     * Builds a new Generation onto the graph. (This includes both Relationships and Things, so
     * this method is not to be used for the last, Relationships-only Generation.)
     */
    async buildGeneration(): Promise<void> {
        // Get the IDs of the Things for the new Generation.
        const thingIdsForGeneration = this.newGenerationThingIds

        // Get an array of those Thing IDs for the new Generation that will be stored (which means
        // excluding any Thing IDs which are already in the Graph).
        const thingIdsToStore = this.nextGenerationThingIdsToStore

        // Store the Thing database models corresponding to those IDs.
        await storeGraphDbModels<ThingDbModel>("Thing", thingIdsToStore)

        // Create the new, empty Generation.
        const newGeneration = new Generation(this.generationIdToBuild, this.#graph)
        
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

        // Get the IDs of the Things for the new Generation.
        const memberIdsForGeneration =
            this.newGenerationThingIds
                .filter( id => this.#graph.thingIdsAlreadyInGraph.includes(id) )
        
        // Create the new, empty Generation and add it to the Generations
        // object as the Relationships-only Generation.
        const newGeneration = new Generation(generationIdToBuild, this.#graph)
        newGeneration.isRelationshipsOnly = true
        this.#relationshipsOnlyMember = newGeneration
        
        // Build the new Generation using its Thing IDs.
        await newGeneration.build(memberIdsForGeneration)
    }

    /**
     * Strip-Generation method.
     * 
     * Strip the most recent Generation from the Graph.
     */
    async stripGeneration(): Promise<void> {
        // Get the ID of the Generation to strip. (If there is none, abort.)
        const generationToStrip = this.byId(this.generationIdToStrip)
        if (!generationToStrip) return
        
        // Mark the Generation as in the process of being stripped.
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
        removeItemFromArray(this.#members, generationToStrip)

        // Mark the Generation as stripped.
        generationToStrip.lifecycleStatus = "stripped"
    }

    /**
     * Adjust-Generations-to-Graph-depth method.
     * 
     * Either build or strip Generations as needed to bring the Graph to its specified depth.
     */
    async adjustToDepth(): Promise<void> {
        // While the the difference between the Graph's current depth and its specified depth
        // still exists, correct it.
        let buildOrNot = this.needBuild
        while (buildOrNot) {
            if (buildOrNot) await this.buildGeneration()
            else await this.stripGeneration()
            buildOrNot = this.needBuild
        }
        
        // If the last Generation added was empty (which can happen when using the Grid build
        // method), strip it.
        if (this.seedGeneration && !this.seedGeneration.thingCohorts.length) await this.stripGeneration()

        // Once the actual number of Generations is equal to the specified depth, build (or re-
        // build) the Relationships-only Generation.
        await this.buildRelationshipsOnlyGeneration()
    }
}