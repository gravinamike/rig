// Import types.
import type { HalfAxisId } from "$lib/shared/constants"
import type {
    Direction, Space, Graph, Generation, GenerationMember, Thing
} from "$lib/models/constructModels"
// Import constants.
import { offsetsByHalfAxisId } from "$lib/shared/constants"
// Import stores.
import { getGraphConstructs, graphDbModelInStore } from "$lib/stores"
import type { GridLayer } from "./gridLayer"


/**
 * Thing Cohort address type.
 * 
 * Represents the unique location of a Thing Cohort in the Graph it is part of,
 * in terms of Graph, Generation, parent Thing, and Direction.
 */
export type ThingCohortAddress = {
    graph: Graph,
    generationId: number,
    parentThingId: number | null,
    directionId: number | null
}

/**
 * Grid coordinates type.
 * 
 * Represents the unique location of a Thing Cohort in the Graph it is part of,
 * in terms of coordinates on the "Euclidean" axes (where each relational step
 * in the same Direction increments the coordinate on the corresponding axis).
 * The three numbers represent the vertical, horizontal, perpendicular-to-the-
 * screen, and encapsulating axes. "Positive" coordinates are down, right,
 * away, and inwards.
 */
export type GridCoordinates = [number, number, number, number]

/**
 * Thing Cohort class.
 * 
 * Represents a cohort of Things, meaning a group of "sibling" Things that are
 * directly descended from the same parent Thing in the same Direction.
 */
export class ThingCohort {
    // String identifier for this type of Graph construct.
    kind = "thingCohort"

    // The unique address of the Thing Cohort in its Graph.
    address: ThingCohortAddress

    // The Thing Cohort's coordinates on the Euclidean grid.
    gridCoordinates: GridCoordinates

    gridLayer: GridLayer | null = null

    // The Generation that the Thing Cohort belongs to.
    generation: Generation | null

    // The Thing Cohort's parent Thing.
    parentThing: Thing | null = null
    
    // The Thing Cohort's Generation members (Things wrapped with extra
    // information.)
    members: GenerationMember[]

    // The number of times the Thing Cohort has been "encapsulated" as part of
    // a Thing. (Not currently in use.)
    encapsulatingDepth: number

    // The axial elongation factor, which controls how much longer or taller
    // the Thing Cohort is than its smaller dimension.
    axialElongation = 1


    /**
     * Thing Cohort constructor.
     * 
     * Creates a Thing Cohort.
     * @param address - The unique address of the Thing Cohort in its Graph.
     * @param gridCoordinates - The unique coordinates of the Thing Cohort in its Graph.
     * @param members - An array of the Thing's Generation Members.
     */
    constructor(address: ThingCohortAddress, gridCoordinates: GridCoordinates, members: GenerationMember[]) {
        // Set the address, coordinates and members, and set this Thing Cohort
        // as the parent Thing Cohort for each of the member Things.
        this.address = address
        this.gridCoordinates = gridCoordinates
        this.members = members
        for (const member of members) if (member.thing) member.thing.parentThingCohort = this

        // Set the Thing Cohort's Generation.
        this.generation =
            // If the Thing Cohort's address identifies its Generation as the
            // last, Relationships-only Generation, set it to that Generation.
            this.address.generationId === this.address.graph.generations.asArray.length ?
                this.address.graph.generations.relationshipsOnlyGeneration :
            // Otherwise get the Generation corresponding to the Generation ID
            // in the address.
            this.address.graph.generations.byId(this.address.generationId)
        // Add this Thing Cohort to that Generation.
        this.generation?.thingCohorts.push(this)

        // Calculate the encapsulating depth from the parent Thing Cohort's
        // encapsulating depth and the Thing Cohort's Direction.
        const parentEncapsulatingDepth = this.parentThingCohort()?.encapsulatingDepth || 0
        const changeInEncapsulatingDepth = offsetsByHalfAxisId[this.halfAxisId || 0][3]
        this.encapsulatingDepth = parentEncapsulatingDepth + changeInEncapsulatingDepth
    }


    /**
     * Parent-Thing-ID getter.
     * 
     * Gets the ID of the Thing Cohort's parent Thing, as an attribute.
     * @returns - The ID of the Thing Cohort's parent Thing (or null if it has none).
     */
    get parentThingId(): number | null {
        return this.address.parentThingId || null
    }
  
    /**
     * Index-of-grandparent-Thing getter.
     * 
     * Gets the index of the Thing Cohort's grandparent Thing in its Thing
     * Cohort, as an attribute.
     * @returns - The index of the Thing Cohort's grandparent Thing in its Thing Cohort (or null if there is no grandparent Thing).
     */
    get indexOfGrandparentThing(): number | null {
        // Get the ID of the grandparent Thing.
        const grandparentThingId = this.parentThingCohort()?.address.parentThingId || null
    
        // Get the index of the Generation member in the granparent Thing
        // Cohort that matches that Thing ID. (If none, return null.)
        let indexOfGrandparentThing =
            grandparentThingId !== null ?  this.members.findIndex( member => member.thingId === grandparentThingId )
            : null
        if (indexOfGrandparentThing === -1) indexOfGrandparentThing = null

        // Return that index.
        return indexOfGrandparentThing
    }

    /**
     * Is-retrograde method.
     * 
     * Indicates whether the Thing Cohort (and by extension, its half-axis) is "retrograde", or
     * doubled-back in the opposite Direction of its parent Thing's Thing Cohort.
     * @returns - Whether the Thing Cohort is retrograde.
     */
    get isRetrograde(): boolean {
        // The Thing Cohort is retrograde if...
        const isRetrograde = (
            // ...it contains the Thing Cohort's grandparent Thing.
            this.indexOfGrandparentThing !== null
            && this.indexOfGrandparentThing !== -1
        )

        // Return whether the Thing Cohort is retrograde.
        return isRetrograde
    }
    
    /**
     * Parent-Thing-Cohort method.
     * 
     * Gets the Thing Cohort's parent Thing Cohort (the Thing Cohort which its
     * parent Thing belongs to).
     * @returns - The Thing Cohort's parent Thing Cohort (or null if it has none).
     */
    parentThingCohort(): ThingCohort | null {
        return this.parentThing?.parentThingCohort || null
    }

    /**
     * Half-axis-ID getter.
     * 
     * Gets the ID of the Thing Cohort's half-axis, as an attribute.
     */
    get halfAxisId(): HalfAxisId {
        // Calculate the half-axis ID from the parent Thing's Space and this
        // Thing Cohort's Direction ID.
        const halfAxisId =
            (
                this.address.directionId
                && this.parentThing
            ) ? (this.parentThing.space as Space).halfAxisIdByDirectionId[this.address.directionId] :
            0
        
        // Return the half-axis ID.
        return halfAxisId
    }

    /**
     * Direction getter.
     * 
     * Gets the Thing Cohort's Direction, as an attribute.
     * @returns - The Thing Cohort's Direction, or null if it has none.
     */
    get direction(): Direction | null {
        // Get this Thing Cohort's Direction.
        const direction =
            this.address.directionId ? getGraphConstructs("Direction", this.address.directionId) as Direction :
            null

        // Return that Direction.
        return direction
    }

    /**
     * Is-in-Relationships-only-Generation getter.
     * 
     * Gets whether this Thing Cohort is in the Graph's last, Relationships-
     * only Generation, as an attribute.
     * @returns - Whether this Thing Cohort is in the Graph's last, Relationships-only Generation.
     */
    get isInRelationshipsOnlyGeneration(): boolean {
        // If the Graph has a Relationships-only Generation and its ID is the
        // same as the ID of this Thing Cohort's Generation,
        if (
            this.address.graph.generations.relationshipsOnlyGeneration !== null
            && this.address.generationId === this.address.graph.generations.relationshipsOnlyGeneration.id

        // Return true.
        ) {
            return true

        // Otherwise return false.
        } else {
            return false
        }
    }

    /**
     * Row-or-column method.
     * 
     * Describes whether the members of the Thing Cohort are visually arranged
     * in a row or a column.
     * @returns - A string indicating whether the Thing Cohort is arranged as a row or a column.
     */
    rowOrColumn(): "row" | "column" {
        return this.halfAxisId !== null && [3, 4, 5, 6, 7, 8].includes(this.halfAxisId) ?
            "column" :
            "row"
    }

    /**
     * Index-of-member-by-ID method.
     * 
     * Gets the index of the Generation member in this Thing Cohort that has
     * the specified Thing ID.
     * @param thingId - The Thing ID to find the index for.
     * @returns - The index of the corresponding Generation member in this Thing Cohort.
     */
    indexOfMemberById(thingId: number): number | null {
        const index = this.members.findIndex( member => member.thingId === thingId )
        const output = index !== -1 ? index : null
        return output
    }

    /**
     * Add-member method.
     * 
     * Adds a Generation member to the Thing Cohort.
     * @param member - The Generation member to add.
     */
    addMember(member: GenerationMember): void {
        // If the Generation member is already in the Thing Cohort, abort.
        if (this.members.includes(member)) return

        // Add the Generation member to the Thing Cohort's members array.
        this.members = [...this.members, member]

        // If the member's Thing is set,
        if (member.thing) {
            // If the Thing doesn't have a parent Thing Cohort yet, set this
            // Thing Cohort as the parent.
            if (!member.thing.parentThingCohort) member.thing.parentThingCohort = this

            // Set the Thing's Graph to the Graph in this Thing Cohort's
            // address.
            member.thing.graph = this.address.graph
        }
    }

    /**
     * Remove-member-by-ID method.
     * 
     * Removes a Generation member from the Thing Chort by its Thing ID.
     * @param thingId - The Thing ID of the Generation member to remove.
     */
    removeMemberById(thingId: number): void {
        // Get the index of the Generation member matching the specified Thing
        // ID.
        const index = this.members.findIndex(member => member.thingId === thingId)

        // Remove that member from the Thing Cohort's members array.
        if (index > -1) this.members.splice(index, 1)
    }

    /**
     * Remove-from-groups method.
     * 
     * Removes the Thing Cohort from any Generation and Plane it is part of.
     */
    removeFromGroups(): void {
        // Get the Generation this Thing Chort is part of.
        const generation = this.address.graph.generations.byId(this.address.generationId)

        // If that Generation exists, remove this Thing Chort from that
        // Generation.
        if (generation) {
            const index = generation.thingCohorts.indexOf(this)
            if (index > -1) generation.thingCohorts.splice(index, 1)
        }

        // If the Thing Cohort is part of a Grid Layer, remove it from that
        // Grid Layer.
        if (this.gridLayer) this.address.graph.gridLayers.removeThingCohortFromGridLayer(this, this.gridLayer.id)
    }






    build(thingIds: number[], thingIdsForNextGeneration: number[], graph: Graph) {
        // Get the IDs of the Things for that half-axis' Thing Cohort.
        const thingIdsForChildThingCohort =
            thingIds.length ? thingIdsForNextGeneration
                .filter( thingIdForNextGeneration => {if (thingIds.includes(thingIdForNextGeneration)) return true} ) :
            []

        // For each of those Thing IDs, create a corresponding Generation Member and add it to
        // that Thing Cohort.
        for (const thingId of thingIdsForChildThingCohort) {
            // Construct a new Thing, based on the ThingDBModel in the store for
            // that ID (or null if there is none).
            const thing =
                graphDbModelInStore("Thing", thingId) ? getGraphConstructs<Thing>("Thing", thingId) :
                null

            // Determine if the new Thing already exists in the Graph.
            const alreadyRendered = graph.thingIdsAlreadyInGraph.includes(thingId) ?? false
            
            // Wrap the new Thing in a Generation member object.
            const member: GenerationMember = {
                thingId: thingId,
                thing: thing,
                alreadyRendered: alreadyRendered
            }

            // Add the Generation member to the child Thing Cohort.
            this.addMember(member)
        }
    }








    /**
     * Should-be-rendered attribute.
     * 
     * Indicates whether the Thing Cohort should be rendered in the Graph, as an attribute.
     */
    get shouldBeRendered() {
        if (
            this.parentThing === null
            || this.parentThing.id == null
            || this.parentThing.graph === null
            || this.generation === null
            || this.direction === null
            || this.direction.id === null
        ) return false



        const directionIdsToCheck: (number | "Space" | "all")[] =
            this.parentThing.graph.isOutline ? (
                this.parentThing.graph.startingSpace?.includesDirectionId(this.direction.id) ? ["Space", "all"] :
                ["all"]
            ) :
            [this.direction.id]



        // The Thing Cohort should be rendered if...
        const shouldBeRendered = (
            // ...the Thing Cohort isn't empty, and...
            this.members.length !== 0

            && (
                // ...the Thing Cohort's Generation is less than or equal to the Graph's Depth,
                // or...
                this.address.generationId <= this.parentThing.graph.depth

                // ...the Direction of the Thing Cohort from its root Thing is flagged as expanded,
                // or...
                || directionIdsToCheck.some(
                    directionIdToCheck => (this.parentThing?.graph as Graph).directionFromThingIsExpanded(
                        (this.parentThing?.id as number),
                        directionIdToCheck
                    )
                )

                // ...it's the last, Relationships-only Generation and at least some of the
                // Relationships in it are to Things that are already rendered in the Graph
                // (versus to Things that are "over the horizon" of the Graph's Depth).
                || (
                    this.generation.isRelationshipsOnly
                    && this.members.some(member => member.alreadyRendered)
                )
            )
        )

        // Return whether the Thing Cohort should be rendered.
        return shouldBeRendered
    }


    
}