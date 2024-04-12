// Import types.
import type { Graph, ThingCohortAddress, GridCoordinates } from "$lib/models/constructModels"

// Import stores.
import { graphDbModelInStore, getGraphConstructs } from "$lib/stores"

// Import Graph constructs.
import { Thing, ThingCohort } from "$lib/models/constructModels"




/**
 * Generation member (a wrapper for Things that also contains their IDs and whether or not they
 * have been rendered in the Graph yet).
 */
export interface GenerationMember {
    thingId: number | null
    thing: Thing | null
    alreadyRendered: boolean
}

/**
 * Generation class.
 * 
 * Represents one of a Graph's Generations, meaning sets of Things that are added step-wise to the
 * Graph as it is built out from the Perspective Thing.
 */
export class Generation {
    // String identifier for this type of Graph construct.
    kind = "generation"

    // The Graph that the Generation is part of.
    graph: Graph

    // The ID of the Generation.
    id: number

    // Whether the Generation is the last, Relationships-only Generation of the
    // Graph.
    #isRelationshipsOnly = false

    // The Generation's Thing Cohorts.
    thingCohorts: ThingCohort[] = []

    // Which lifecycle stage the Generation is currently in.
    lifecycleStatus: "new" | "building" | "built" | "stripping" | "stripped" = "new"



    /**
     * Generation constructor.
     * 
     * Creates a Generation.
     * @param id - The ID of the new Generation.
     * @param graph - The Graph that the new Generation belongs to.
     */
    constructor(id: number, graph: Graph) {
        this.id = id
        this.graph = graph
    }



    /**
     * Generation-is-Relationships-only getter.
     * 
     * Gets whether the Generation is the last, Relationships-only Generation, as an attribute.
     * @returns - Whether the Generation is the last, Relationships-only Generation.
     */
    get isRelationshipsOnly(): boolean {
        return this.#isRelationshipsOnly
    }

    /**
     * Is-Relationships-only setter.
     * 
     * Sets whether the Generation is the last, Relationships-only Generation, as an attribute.
     */
    set isRelationshipsOnly(isRelationshipsOnly: boolean) {
        this.#isRelationshipsOnly = isRelationshipsOnly
    }

    /**
     * Parent-Generation getter.
     * 
     * Gets the Generation's parent Generation, as an attribute.
     * @returns - The Generation's parent Generation, or null if there is none.
     */
    get parentGeneration(): Generation | null {
        // If this is Generation 0 (the root Generation), it has no parent, so return null.
        if (this.id === 0) {
            return null

        // Otherwise, return the Generation from this Graph with ID one less than the ID of this
        // Generation.
        } else {
            return this.graph.generations.byId(this.id - 1)
        }
    }

    /**
     * Generation-members getter.
     * 
     * Gets an array of the Generation's members (Things wrapped with extra information), as an
     * attribute.
     * @returns - An array of the Generation's members.
     */
    get members(): GenerationMember[] {
        // Create an array of the Generation's members, aggregated from the Generation's Thing
        // Cohorts.
        const members: GenerationMember[] = []
        for (const thingCohort of this.thingCohorts) members.push(...thingCohort.members)

        // Return that array.
        return members
    }

    /**
     * Generation-members-by-ID getter.
     * 
     * Gets an object containing the Generation's members (Things wrapped with extra information),
     * keyed by their Thing IDs, as an attribute.
     * @returns - An object containing the Generation's members, keyed to their Thing IDs.
     */
    get membersById(): { [memberId: number]: GenerationMember } {
        // Construct an object of the Generation's members, keyed by their Thing IDs.
        const membersById: { [memberId: number]: GenerationMember } = {}
        for (const member of this.members) if (member.thingId) membersById[member.thingId] = member

        // Return that array.
        return membersById
    }

    /**
     * Things method.
     * 
     * Gets an array of all the Things in this Generation. Filters out any null "placeholder"
     * Things or Things which have already been rendered in the Graph.
     * @returns - An array of all the Things in this Generation.
     */
    things(): Thing[] {
        // Get an array of all the members of this Generation...
        const things =
            this.members
                // ...which...
                .filter(
                    member => {
                        return (
                            // ...are not null, and...
                            member.thing !== null

                            // ...have not already been rendered.
                            && member.alreadyRendered === false
                        )
                    }
                )
                // Then get the Things from those Generation members.
                .map(member => member.thing) as Thing[]

        // Return the array of Things.
        return things
    }


    /**
     * Build-Generation method.
     * 
     * Builds (or re-builds) the Generation from an empty state.
     * @param thingIdsForGeneration - The IDs of the Generation's member Things, which are used to access and add these Things to the Generation.
     */
    async build(thingIdsForGeneration: number[]): Promise<void> {
        this.lifecycleStatus = "building"

        // For Generation 0, add the Things to the Graph's "root" Thing Cohort, which serves as the
        // starting point of the Graph.
        if (this.id === 0) {
            // Get the address for the root Thing Cohort.
            const addressForCohort: ThingCohortAddress = {
                graph: this.graph,
                generationId: this.id,
                parentThingId: null,
                directionId: null
            }
            
            // Get the grid coordinates for the root Thing Cohort.
            const gridCoordinatesForCohort: GridCoordinates = [0, 0, 0, 0]

            // Create the new, empty root Thing Cohort.
            this.graph.rootCohort = new ThingCohort(addressForCohort, gridCoordinatesForCohort, [])

            // For each Thing ID to be added to the Generation, add a corresponding
            // GenerationMember to the new root Thing Cohort.
            for (const thingId of thingIdsForGeneration) {
                // Construct a new Thing, based on the ThingDBModel in the store for that ID (or
                // null if there is none).
                const thing =
                    graphDbModelInStore("Thing", thingId) ? getGraphConstructs<Thing>("Thing", thingId) :
                    null

                // Determine if the new Thing already exists in the Graph.
                const alreadyRendered = this.graph.thingIdsAlreadyInGraph.includes(thingId)
                
                // Create a Generation Member wrapper for the Thing.
                const member: GenerationMember = {
                    thingId: thingId,
                    thing: thing,
                    alreadyRendered: alreadyRendered
                }

                // Add the Generation member to the Graph's root Thing Cohort.
                this.graph.rootCohort.addMember(member)
            }

            // Add the new root Thing Cohort to the Graph's Grid Layer 0.
            await this.graph.gridLayers.addThingCohortToGridLayer(this.graph.rootCohort, 0)

            // Set the Graph's Perspective Thing to the (ideally only!) Thing in the root Thing
            // Cohort.
            this.graph.pThing = this.graph.rootCohort.members[0].thing


        // For all Generations after 0, hook up that Generation's members, packaged in Thing
        // Cohorts, to the parent Things of the previous Generation.
        } else {
            // For each Thing in the previous Generation (excluding null "placeholders"),
            for (const prevThing of this.parentGeneration?.things() || []) {
                // Build that Thing, hooking it up to the new Things in the to-be-built Generation.
                await prevThing.build(this.id, thingIdsForGeneration, this.isRelationshipsOnly)
            }
        }

        // Mark the Generation as built.
        this.lifecycleStatus = "built"
    }
}