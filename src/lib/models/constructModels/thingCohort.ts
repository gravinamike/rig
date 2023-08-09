// Import types.
import type { HalfAxisId } from "$lib/shared/constants"
import type {
    Direction, Space, Graph, Generation, GenerationMember, Plane, Thing
} from "$lib/models/constructModels"
// Import constants.
import { offsetsByHalfAxisId } from "$lib/shared/constants"
// Import stores.
import { getGraphConstructs } from "$lib/stores"


/**
 * Thing Cohort address type.
 * 
 * Represents the unique location of a Thing Cohort in the Graph it is part of.
 */
export type ThingCohortAddress = {
    graph: Graph,
    generationId: number,
    parentThingId: number | null,
    directionId: number | null
}

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
    gridCoordinates: [number, number, number] | null = null

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

    // The visual plane (perpendicular to the screen) that the Thing Cohort
    // belongs to.
    plane: Plane | null = null

    // The axial elongation factor, which controls how much longer or taller
    // the Thing Cohort is than its smaller dimension.
    axialElongation = 1


    /**
     * Thing Cohort constructor.
     * 
     * Creates a Thing Cohort.
     * @param address - The unique address of the Thing Cohort in its Graph.
     * @param members - An array of the Thing's Generation Members.
     */
    constructor(address: ThingCohortAddress, members: GenerationMember[]) {
        // Set the address and members, and set this Thing Cohort as the parent
        // Thing Cohort for each of the member Things.
        this.address = address
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

        // Set the Thing Cohort's Plane ID.
        let planeId: number
        // If there is no address set, set the Plane ID to 0.
        if (!this.address) {
            planeId = 0
        // Otherwise, calculate the Plane ID from the parent Thing Cohort's
        // Plane ID and the Thing Cohort's Direction.
        } else {
            const parentPlaneId = this.parentThingCohort()?.plane?.id || 0
            const changeInPlane = offsetsByHalfAxisId[this.halfAxisId || 0][2]
            planeId = parentPlaneId + changeInPlane
        }
        // If the Generation isn't the Relationships-only Generation, add this
        // Thing Cohort to the Plane.
        if (
            this.generation
            && !this.generation.isRelationshipsOnly
        ) this.address.graph.planes.addCohortToPlane(this, planeId)

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

        // If this Thing Cohort is part of a Plane, remove it from that Plane.
        if (this.plane) this.plane.removeCohort(this)
    }
}