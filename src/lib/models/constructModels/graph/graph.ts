// Import types.
import type { ThingDbModel } from "$lib/models/dbModels"
import type { Space, Thing, ThingCohort } from "$lib/models/constructModels"
// Import stores and related methods.
import { storeGraphDbModels, getGraphConstructs, unstoreGraphDbModels, perspectiveSpaceIdStore } from "$lib/stores"
// Import Graph-related structures.
import { Generations } from "./generations"
import { Planes } from "./planes"
import { PerspectiveHistory } from "./history"
// Import utility functions.
import { updateUrlHash } from "$lib/shared/utility"
// Import API methods.
import { deleteThing, deleteRelationship } from "$lib/db/makeChanges"


/**
 * Graph class.
 * 
 * Represents a Graph, which is a collection of Things and the Relationships
 * that connect them, plus related information. A Graph is a representation of
 * some smaller portion of a Unigraph (a network of Things and Relationships
 * stored as a database file). The Graph is built out from a "Pespective" Thing
 * in stages, exploring outwards into the Unigraph by some predefined distance.
 */
export class Graph {
    // The Graph's ID.
    id: number

    // The Graph that contains this Graph, if any.
    parentGraph: Graph | null

    // Array of Graphs that this Graph contains, if any.
    childGraphs: Graph[] = []

    // Whether the Graph is part of a list of a Thing's off-axis relations.
    offAxis: boolean

    // Whether the Graph is being used as the visualizer in a search interface.
    inSearchMenu: boolean

    // The IDs of the Graph's Perspective Things (currently there should only
    // be 1 Perspective Thing).
    #pThingIds: number[]
    
    // The Graph's Perspective Thing.
    pThing: Thing | null = null

    // The Thing Cohort at the "root" of the Graph, containing the Perspective
    // Thing.
    rootCohort: ThingCohort | null = null

    // The number of Relationship "steps" to render from the Perspective Thing.
    #depth: number

    // The Graphs Generations, arrays of Things added to the Graph step-wise,
    // each building out a distance of 1 Relationship from the Things in the
    // previous Generation.
    generations: Generations

    // The Graph's Planes, flat surfaces perpendicular to the screen which
    // contain all the Things at that visual distance.
    planes: Planes

    // The Space that is initially used when the Graph is built.
    #startingSpace: Space | null

    // The original value of `startingSpace` when the Graph is initialized;
    // this value is used when rebuilding if the `keepCurrentSpace` flag is
    // set on `build()`.
    originalStartingSpace: Space | null

    // The history of Things that the Graph has been Perspected on previously.
    history: PerspectiveHistory

    // The current stage of the Graph's lifecycle.
    lifecycleStatus: "new" | "building" | "built" | "cleared" = "new"

    // Whether a Thing Form is currently active in the Graph.
    formActive: boolean



    buildMethod: "radial" | "grid" = "grid"




    /**
     * Graph constructor.
     * 
     * Creates a new Graph.
     * @param pThingIds - IDs for the Graph's starting Perspective Things.
     * @param depth - How many Relationship "steps" to grow the Graph from the Perspective Things.
     */
    constructor(
        id: number,
        parentGraph: (Graph | null)=null,
        offAxis=false,
        inSearchMenu=false,
        pThingIds: number[],
        depth: number,
        startingSpace: (Space | null)=null
    ) {
        this.id = id
        this.parentGraph = parentGraph
        this.parentGraph?.childGraphs.push(this)
        this.offAxis = offAxis
        this.inSearchMenu = inSearchMenu
        this.#pThingIds = pThingIds
        this.#depth = depth
        this.generations = new Generations(this)
        this.planes = new Planes(this)
        this.#startingSpace = startingSpace
        this.originalStartingSpace = startingSpace
        this.history = new PerspectiveHistory()        
        this.formActive = false
    }


    /* Getters and setters. */

    /**
     * Perspective-Thing-IDs getter method.
     * 
     * Gets the IDs of the Graph's Perspective Things.
     * @returns - An array of the Perspective Thing IDs.
     */
    get pThingIds(): number[] {
        return this.#pThingIds
    }

    /**
     * Set-Perspective-Thing-IDs method.
     * 
     * Sets the IDs of the Graph's Perspective Things. Also rebuilds the Graph
     * to reflect the changed Perspective.
     * @param pThingIds - The Perspective Thing IDs to set.
     * @param updateHistory - Whether to update the Graph History to reflect the changed Perspective.
     */
    async setPThingIds(pThingIds: number[], updateHistory=true): Promise<void> {
        // Set the Perspective Thing IDs.
        this.#pThingIds = pThingIds

        // Rebuild the Graph.
        await this.build(false, updateHistory)
    }

    /**
     * Graph-depth getter.
     * 
     * Provides the Graph's depth as an attribute.
     * @returns - The depth of the Graph.
     */
    get depth(): number {
        return this.#depth
    }

    /**
     * Set-Graph-depth method.
     * 
     * Sets the Graph's depth. Also adjusts the Graph's Generations based on
     * the new depth.
     * @param depth - The new Graph depth to set.
     */
    async setDepth(depth: number): Promise<void> {
        // Set the Graph's depth.
        this.#depth = depth

        // Adjust the Graph's generations based on the new depth.
        await this.generations.adjustToDepth(this.#depth)
    }    

    /**
     * Set-starting-Space method.
     * 
     * Sets the Graph's starting Space'. Also rebuilds the Graph to reflect the
     * changed Space.
     * @param space - The starting Space to set.
     */
    async setSpace(space: Space): Promise<void> {
        // Set the starting Space.
        this.#startingSpace = space

        // Rebuild the Graph to reflect the changed Space.
        await this.build()
    }

    /**
     * Starting-Space getter.
     * 
     * Provides the Graph's starting Space as an attribute.
     * @returns - The Graph's starting Space (or null if none is set).
     */
    get startingSpace(): Space | null {
        return this.#startingSpace
    }

    /**
     * Thing-IDs-already-in-Graph getter.
     * 
     * Provides an array of the IDs of all the Things currently in the Graph,
     * as an attribute.
     * @return - An array of the IDs of all the Things currently in the Graph.
     */
    get thingIdsAlreadyInGraph(): number[] {
        const thingIdsAlreadyInGraph = this.generations.things
            .map(thing => thing.id)
            .filter(thingId => thingId) as number[]
            
        return thingIdsAlreadyInGraph
    }

    

    /**
     * Build-Graph method.
     * 
     * Resets the Graph and builds new Generations up to its specified depth.
     * @param keepCurrentSpace - Whether to keep any existing Space from a previous build, or start fresh from the Graph's original starting Space.
     * @param updateHistory - Whether to update the Graph History by adding the current Perspective Thing.
     */
    async build(keepCurrentSpace=true, updateHistory=true): Promise<void> {
        // Set (or reset) build attributes to their starting values.
        this.rootCohort = null
        this.generations.reset()
        this.planes.reset()
        if (!keepCurrentSpace) this.#startingSpace = this.originalStartingSpace
        this.formActive = false
        this.lifecycleStatus = "cleared"

        // Adjust (build) the Generations to the Graph's specified Depth.
        this.lifecycleStatus = "building"
        await this.generations.adjustToDepth(this.#depth)

        // Set the Perspective Thing to the (ideally only!) Thing in the root
        // Thing Cohort.
        this.pThing = (this.rootCohort as unknown as ThingCohort).members[0].thing
        
        // If the Graph is the top-level Graph (rather than a child Graph or a
        // search-interface Graph),
        if (
            !(
                this.parentGraph
                || this.inSearchMenu
            )
        ) {
            // Set the Perspective Space ID store to the ID of this Graph's
            // Perspective Thing.
            const pThingSpaceId = this.pThing?.space?.id || null
            perspectiveSpaceIdStore.set(pThingSpaceId)

            // Update the URL hash to reflect the Space ID.
            updateUrlHash( {spaceId: String(pThingSpaceId)} )
        }
        
        // Add the starting Perspective Thing IDs to the Graph's History.
        if (updateHistory) {
            await this.history.addEntries(this.#pThingIds)
        }
        
        this.lifecycleStatus = "built"
    }

    /**
     * Delete-Thing-by-ID method.
     * 
     * Deletes a Thing from the back-end database by its ID. Also updates the
     * related stores and rebuilds the Graph to reflect the deletion.
     * @param thingId - The ID of the Thing to delete.
     */
    async deleteThingById(thingId: number): Promise<void> {
        // Get the to-be-deleted Thing from the Store. (If null, abort.)
        const deletedThing = getGraphConstructs<Thing>("Thing", thingId)
        if (deletedThing === null) return

        // Delete the Thing from the back-end database. (If failed, abort.)
        const thingDeleted = await deleteThing(thingId)
        if (!thingDeleted) return

        // Re-store any Things that were related to the deleted Thing (in order to
        // update their relations to reflect the deleted Thing's absence).
        const relatedThingIds = deletedThing.relatedThingIds.filter(id => !(id === null)) as number[]
        await storeGraphDbModels<ThingDbModel>("Thing", relatedThingIds, true)

        // Remove the deleted Thing itself from the store.
        await unstoreGraphDbModels("Thing", relatedThingIds)

        // Rebuild the Graph.
        await this.build()
    }

    /**
     * Delete-Relationship-by-Thing-IDs method.
     * 
     * Deletes a Relationship from the back-end database by the IDs of the
     * Things that it relates. Also updates the related stores and rebuilds
     * the Graph to reflect the deletion.
     * @param sourceThingId - The ID of the first of the two Things that are joined by the to-be-deleted Relationship.
     * @param destThingId - The ID of the second of the two Things that are joined by the to-be-deleted Relationship.
     * @returns 
     */
    async deleteRelationshipByThingIds(sourceThingId: number, destThingId: number): Promise<void> {
        // Delete the Relationship from the back-end database. (If failed, abort.)
        const relationshipDeleted = await deleteRelationship(sourceThingId, destThingId)
        if (!relationshipDeleted) return

        // Re-store the Things that were related by the Relationship (in order to
        // update their relations to reflect the Relationship's absence).
        await storeGraphDbModels<ThingDbModel>("Thing", [sourceThingId, destThingId], true)

        // Rebuild the Graph.
        await this.build()
    }
}