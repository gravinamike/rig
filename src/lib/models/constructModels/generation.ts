// Import types.
import type { HalfAxisId } from "$lib/shared/constants"
import type { Graph, Space, ThingCohortAddress, GridCoordinates } from "$lib/models/constructModels"

// Import constants.
import { cartesianHalfAxisIds } from "$lib/shared/constants"

// Import stores.
import { graphDbModelInStore, getGraphConstructs } from "$lib/stores"

// Import Graph constructs.
import { Thing, ThingCohort } from "$lib/models/constructModels"



/**
 * Generation member (a wrapper for Things that also contains their IDs and
 * whether or not they have been rendered in the Graph yet).
 */
export interface GenerationMember {
    thingId: number | null
    thing: Thing | null
    alreadyRendered: boolean
}

/**
 * Generation class.
 * 
 * Represents one of a Graph's Generations, meaning sets of Things that are
 * added step-wise to the Graph as it is built out from the Perspective Thing.
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
     * @param id - The ID of the Generation.
     * @param graph - The Graph that the Generation belongs to.
     */
    constructor(id: number, graph: Graph) {
        this.id = id
        this.graph = graph
    }


    /**
     * Is-Relationships-only getter.
     * 
     * Gets whether the Generation is the last, Relationships-only Generation,
     * as an attribute.
     * @returns - Whether the Generation is the last, Relationships-only Generation.
     */
    get isRelationshipsOnly(): boolean {
        return this.#isRelationshipsOnly
    }

    /**
     * Is-Relationships-only setter.
     * 
     * Sets whether the Generation is the last, Relationships-only Generation,
     * as an attribute.
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
        // If this is Generation 0 (the root Generation), it has no parent, so
        // return null.
        if (this.id === 0) {
            return null

        // Otherwise, return the Generation from this Graph with ID one less
        // than the ID of this Generation.
        } else {
            return this.graph.generations.byId(this.id - 1)
        }
    }

    /**
     * Generation-members getter.
     * 
     * Gets an array of the Generation's members (Things wrapped with extra
     * information), as an attribute.
     * @returns - An array of the Generation's members.
     */
    get members(): GenerationMember[] {
        // Create an array of the Generation's members, aggregated from the
        // Generation's Thing Cohorts.
        const members: GenerationMember[] = []
        for (const thingCohort of this.thingCohorts) {
            members.push(...thingCohort.members)
        }

        // Return that array.
        return members
    }

    /**
     * Generation-members-by-ID getter.
     * 
     * Gets an object containing the Generation's members (Things wrapped with
     * extra information), keyed by their Thing IDs, as an attribute.
     * @returns - An object containing the Generation's members, keyed to their Thing IDs.
     */
    get membersById(): { [memberId: number]: GenerationMember } {
        // Construct an object of the Generation's members, keyed by their
        // Thing IDs.
        const membersById: { [memberId: number]: GenerationMember } = {}
        for (const member of this.members) if (member.thingId) membersById[member.thingId] = member

        // Return that array.
        return membersById
    }

    /**
     * Things method.
     * 
     * Gets an array of all the Things in this Generation. Filters out any null
     * "placeholder" Things or Things which have already been rendered in the
     * Graph.
     * @returns - An array of all the Things in this Generation.
     */
    things(): Thing[] {
        const things =
            this.members
                .filter(member => {
                    return (
                        member.thing !== null
                        && member.alreadyRendered === false
                    )
                })
                .map(member => member.thing) as Thing[]
        return things
    }


    /**
     * Build-Generation method.
     * 
     * Builds (or re-builds) the Generation from an empty state.
     * @param thingIdsForGeneration - The IDs of the Generation's member Things, which are used to
     *                                access and add these Things to the Generation.
     */
    async build(thingIdsForGeneration: number[]): Promise<void> {
        // For Generation 0, add the Things to the Graph's "root" Thing Cohort,
        // which serves as the starting point of the Graph.
        if (this.id === 0) {
            // Get the address of the root Thing Cohort.
            const addressForCohort: ThingCohortAddress = {
                graph: this.graph,
                generationId: this.id,
                parentThingId: null,
                directionId: null
            }
            
            // Get the grid coordinates of the root Thing Cohort.
            const gridCoordinatesForCohort: GridCoordinates = [0, 0, 0, 0]

            // Create a new, empty root Thing Cohort.
            this.graph.rootCohort = new ThingCohort(addressForCohort, gridCoordinatesForCohort, [])

            // For each Thing ID to be added to the Generation,
            for (const thingId of thingIdsForGeneration) {
                // Construct a new Thing based on the Thing database model in
                // the store (or null if there is none).
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

            // Add the new root Thing Cohort to the Graph's Plane 0.
            this.graph.planes.addCohortToPlane(this.graph.rootCohort, 0)

            // Add the new root Thing Cohort to the Graph's Grid Layer 0.
            await this.graph.gridLayers.addThingCohortToGridLayer(this.graph.rootCohort, 0)

            // Set the Graph's Perspective Thing to the (ideally only!) Thing in the root Thing
            // Cohort.
            this.graph.pThing = this.graph.rootCohort.members[0].thing


        // For all Generations after 0, hook up that Generation's members,
        // packaged in Thing Cohorts, to the parent Things of the previous
        // Generation.
        } else {
            // For each Thing in the previous Generation (excluding null
            // "placeholders"),
            for (const prevThing of this.parentGeneration?.things() || []) {
                // Get the IDs of the Directions on that Thing's "Cartesian" axes.
                const cartesianDirectionIds: number[] = []
                for (const cartesianHalfAxisId of cartesianHalfAxisIds) {
                    const cartesianDirectionId = (prevThing.space as Space).directionIdByHalfAxisId[cartesianHalfAxisId]
                    if (cartesianDirectionId) cartesianDirectionIds.push(cartesianDirectionId)
                }

                // For the ID of each half-axis from that Thing (plus any
                // "empty" Cartesian half-axes - 1, 2, 3, 4),
                const directionIdsForCohorts = [...new Set([
                    ...prevThing.relatedThingDirectionIds,
                    ...cartesianDirectionIds])
                ]
                for (const directionId of directionIdsForCohorts) {

                    // Get the address for that half axis' Thing Cohort.
                    const addressForCohort = {
                        graph: this.graph,
                        generationId: this.id,
                        parentThingId: prevThing.id,
                        directionId: directionId
                    }

                    // Get the grid coordinates for that half axis' Thing Cohort.
                    const parentThingsThingCohort = prevThing.parentThingCohort
                    const parentThingsThingCohortGridCoordinates = parentThingsThingCohort?.gridCoordinates as GridCoordinates
                    const halfAxisId = prevThing.space?.halfAxisIdByDirectionId[directionId] as HalfAxisId
                    const coordinateIndexToUpdate =
                        [1, 2].includes(halfAxisId) ? 0 :
                        [3, 4].includes(halfAxisId) ? 1 :
                        [5, 6].includes(halfAxisId) ? 2 :
                        [7, 8].includes(halfAxisId) ? 3 :
                        0
                    const coordinateIncrement = halfAxisId % 2 !== 0 ? 1 : -1
                    const gridCoordinatesForCohort = [...parentThingsThingCohortGridCoordinates] as GridCoordinates
                    gridCoordinatesForCohort[coordinateIndexToUpdate] += coordinateIncrement


                    // If...
                    if (
                        // ...the Graph is using the radial build method, or this is the
                        // Relationships-only Generation, or...
                        (
                            this.graph.pThing?.space?.buildmethod === "radial"
                            || this.isRelationshipsOnly
                        )

                        || (
                            // ...the Graph is using the grid build method, and...
                            this.graph.pThing?.space?.buildmethod === "grid"

                            && (
                                // The absolute value of the grid coordinate for this grid axis is greater
                                // than the absolute value of the parent Thing Cohort's grid coordinate for this grid axis,
                                (
                                    Math.abs(gridCoordinatesForCohort[coordinateIndexToUpdate])
                                    > Math.abs(parentThingsThingCohortGridCoordinates[coordinateIndexToUpdate])
                                )

                                // ...none of the Grid coordinates are outside of the Graph's depth, and...
                                && Math.max(
                                    ...gridCoordinatesForCohort.map(coordinate => Math.abs(coordinate))
                                ) <= this.graph.depth
                            )
                        )
                    ) {
                        // Add a new, empty Thing Cohort on that half-axis.
                        const childThingCohort = new ThingCohort(addressForCohort, gridCoordinatesForCohort, [])
                        
                        // Get the IDs of the Things in that half axis' Thing
                        // Cohort.
                        const childThingCohortThingIds = prevThing.relatedThingIdsByDirectionId[directionId] || []
                        const thingIdsForChildThingCohort =
                            childThingCohortThingIds.length ? thingIdsForGeneration
                                .filter( thingId => {if (childThingCohortThingIds.includes(thingId)) return true} ) :
                            []

                        // For each of those Thing IDs,
                        for (const thingId of thingIdsForChildThingCohort) {
                            // Construct a new Thing based on the Thing database
                            // model in the store (or null if there is none).
                            const thing =
                                graphDbModelInStore("Thing", thingId) ? getGraphConstructs<Thing>("Thing", thingId) :
                                null

                            // Determine if the new Thing already exists in the
                            // Graph.
                            const alreadyRendered = this.graph.thingIdsAlreadyInGraph.includes(thingId)
                            
                            // Wrap the new Thing in a Generation member object.
                            const member: GenerationMember = {
                                thingId: thingId,
                                thing: thing,
                                alreadyRendered: alreadyRendered
                            }
                            
                            // Add the Generation member to the child Thing Cohort.
                            childThingCohort.addMember(member)
                        }
                        
                        // Add the new Thing Cohort to the previous Thing, keyed
                        // by Direction ID.
                        prevThing.childThingCohortByDirectionID(directionId, childThingCohort)


                        // Add the new Thing Cohort to the appropriate Grid Layer.
                        const childThingCohortGridLayerId = Math.max(
                            ...gridCoordinatesForCohort.map(coordinate => Math.abs(coordinate))
                        )
                        await this.graph.gridLayers.addThingCohortToGridLayer(childThingCohort, childThingCohortGridLayerId)
                    }
                }
            }
        }

        // Mark the Generation as built.
        this.lifecycleStatus = "built"
    }
}