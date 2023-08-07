// Import types.
import type { HalfAxisId } from "$lib/shared/constants"
import type { ThingDbModel } from "$lib/models/dbModels"
import type { ThingAddress, RelationshipInfo } from "./types"

// Import constants and stores.
import { oddHalfAxisIds, cartesianHalfAxisIds } from "$lib/shared/constants"
import { graphDbModelInStore, getGraphConstructs } from "$lib/stores"

// Import utility functions.
import { readOnlyArrayToArray } from "$lib/shared/utility"

// Import Graph constructs.
import {
    Graph, Space, ThingCohort, Relationship, Note, NoteToThing, Folder, FolderToThing
} from "$lib/models/constructModels"



/*
 * Thing model.
 *
 * Class representing the defining attributes of a Thing. Generally derived
 * from the database model equivalent, `ThingDbModel`.
 */
export class Thing {
    /* Intrinsic attributes. */

    // String identifier for this type of Graph construct.
    kind = "thing"

    // Database model that the Thing is based on.
    dbModel: ThingDbModel | null = null

    // The Thing's numerical ID.
    id: number | null = null

    // The Thing's GUID (used to uniquely identify it across Graphs).
    guid: string | null = null

    // The Thing's text (displayed in the Graph view).
    text: string | null = null

    // When the Thing was created, last modified, and last visited.
    whencreated: Date | null = null
    whenmodded: Date | null = null
    whenvisited: Date | null = null

    // The ID of the Thing's default Space.
    defaultSpaceId: number | null = null

    // Whether the Thing should inherit the Space of its parent Thing. Located
    // here for now; will be stored in db in the future.
    inheritSpace = true

    // Perspective texts (texts that are used in place of other Things' default
    // texts when this Thing is the Perspective Thing).
    perspectivetexts = "{}"// Default is "{}"

    // Perspective depths (not yet in use).
    perspectivedepths = "{}"// Default is "{}"


    /* Structures that the Thing is part of. */

    // The Graph that the Thing is part of.
    graph: Graph | null = null

    // The Thing Cohort that the Thing is part of.
    parentCohort: ThingCohort | null = null


    /* Related Graph structures (specified by the database). */

    // The Thing's Note and the linker to it.
    note: Note | null = null
    noteToThing: NoteToThing | null = null

    // The Thing's attachments folder and the linker to it.
    folder: Folder | null = null
    folderToThing: FolderToThing | null = null

    // Relationships that start from, or end on, the Thing.
    a_relationships: Relationship[] = []
    b_relationships: Relationship[] = []


    /* Related Graph structures (derived during the Graph build). */

    // The Thing's coordinates on the Euclidean grid.
    gridCoordinates: [number, number, number] | null = null

    // The Thing's child Thing Cohorts, sorted by the ID of their Direction.
    childThingCohortsByDirectionId: { [directionId: number]: ThingCohort } = {}



    /**
     * Thing constructor.
     * 
     * Creates a new Thing.
     * @param dbModel - The database model that the Thing is derived from, or null for a "blank" Thing.
     */
    constructor(dbModel: ThingDbModel | null) {
        // If a ThingDbModel was supplied, copy or adapt...
        if (dbModel) {
            // The ThingDbModel itself,
            this.dbModel = dbModel

            // Its intrinsic attributes,
            this.id = Number(dbModel.id)
            this.guid = dbModel.guid
            this.text = dbModel.text
            this.whencreated = dbModel.whencreated ? new Date(dbModel.whencreated): null
            this.whenmodded = dbModel.whenmodded ? new Date(dbModel.whenmodded): null
            this.whenvisited = dbModel.whenvisited ? new Date(dbModel.whenvisited): null
            this.defaultSpaceId = dbModel.defaultplane
            this.perspectivedepths = dbModel.perspectivedepths
            this.perspectivetexts = dbModel.perspectivetexts

            // Its related structures.
            this.note = dbModel.note ? new Note(dbModel.note) : null
            this.noteToThing = dbModel.noteToThing ? new NoteToThing(dbModel.noteToThing) : null
            this.folder = dbModel.folder ? new Folder(dbModel.folder) : null
            this.folderToThing = dbModel.folderToThing ? new FolderToThing(dbModel.folderToThing) : null    
            for (const relationshipDbModel of dbModel.a_relationships) {
                this.a_relationships.push( new Relationship(relationshipDbModel) )
            }
            for (const relationshipDbModel of dbModel.b_relationships) {
                this.b_relationships.push( new Relationship(relationshipDbModel) )
            }
        }
    }


    /* Attributes related to the Thing's surrounding Graph context. */

    /**
     * Thing Address.
     * 
     * Gets an object specifying the unique position of the Thing in the Graph
     * it's part of, or null if it's not part of a Graph.
     */
    get address(): ThingAddress | null {
        // If the Thing has no ID or parent Thing Cohort (it's not yet part of
        // a Graph), return null.
        if (!this.id || !this.parentCohort) return null

        // Construct the address.
        const address = {
            graph: this.parentCohort.address.graph,
            generationId: this.parentCohort.address.generationId,
            parentThingId: this.parentCohort.address.parentThingId,
            halfAxisId: this.parentCohort.halfAxisId,
            indexInCohort: this.parentCohort.indexOfMemberById(this.id) || -1
        }

        // Return the address.
        return address
    }
    
    /**
     * Parent Thing.
     * 
     * The Thing that this Thing is a child of (or null if there is none).
     */
    get parentThing(): Thing | null {
        return this.parentCohort?.parentThing || null
    }


    /* Space- and Direction-related attributes. */

    /**
     * Thing's Space.
     * 
     * The Space that will be used to render the Thing's child Things and
     * Relationships, or null if the Thing has not yet been added to a
     * Graph.
     */
    get space(): Space | null {
        // If the Thing has not yet been added to a Graph, return null.
        if (!this.graph) return null

        // Declare the space.
        let space: Space | null

        // If the Graph has a starting Space and this is the Perspective Thing,
        // use the starting Space.
        if (this.graph.startingSpace && !this.parentThing) {
            space = this.graph.startingSpace
            
        // Else, if...
        } else if (
            (
                // ... the Thing Widget Model doesn't have a parent,
                !this.parentThing
                // ... or is set not to inherit Space from a parent,
                || !this.inheritSpace
            )
            // ... and the Thing Widget Model has a default Space set,
            && this.defaultSpaceId
            // ... and that default Space is in the Store,
            && graphDbModelInStore("Space", this.defaultSpaceId)
        ) {
            // ...use the Thing Widget Model's own default Space.
            space = getGraphConstructs<Space>("Space", this.defaultSpaceId) as Space

        // Else, if the Thing Widget model has a parent, inherit the parent's Space.
        } else if (this.parentThing) {
            space = this.parentThing.space

        // If all else fails, just use the first Space in the list of Spaces.
        } else {
            space = getGraphConstructs<Space>("Space", 1)
        }

        return space
    }

    /**
     * Related Thing Direction IDs.
     * 
     * An array of IDs for the Direction of each related Thing.
     */
    get relatedThingDirectionIds(): number[] {
        const relatedThingDirectionIds = Object.keys(this.relatedThingIdsByDirectionId).map(k => Number(k))
        return relatedThingDirectionIds
    }

    /**
     * Related-Thing half-axis IDs.
     * 
     * A set of IDs for the half-axes of this Thing's related Things.
     */
    get relatedThingHalfAxisIds(): Set<HalfAxisId> {
        // If the Thing has no Space, return an empty set.
        if (!this.space) return new Set()

        // Initialize an empty set of half-axis IDs.
        const relatedThingHalfAxisIds: Set<HalfAxisId> = new Set()

        // For each Direction ID that has related Things,
        for (const directionID of this.relatedThingDirectionIds) {
            // Get the ID of the corresponding half-axis.
            const halfAxisId = this.space.halfAxisIdByDirectionId[directionID]

            // Add the half-axis ID to the set.
            if (halfAxisId) relatedThingHalfAxisIds.add(halfAxisId)
        }
        
        // Return the set of half-axis IDs.
        return relatedThingHalfAxisIds
    }
    
    /**
     * Direction ID by half-axis ID.
     * 
     * An object that maps the Thing's half-axis IDs to the corresponding
     * Direction ID.
     */
    get directionIdByHalfAxisId(): { [halfAxisId: number]: number | null } {
        // If the Thing has no Space, return an empty object.
        if (!this.space) return {}

        // Initialize an empty object of half-axis-IDs/Direction ID mappings.
        const directionIdByHalfAxisId: { [halfAxisId: number]: number | null } = {}

        // For each odd half-axis ID,
        for (const oddHalfAxisId of oddHalfAxisIds) {
            // Get the Direction, for this Space, that is on that half-axis.
            const direction = this.space.directions[(oddHalfAxisId - 1)/2]

            // Add the IDs of the Direction and its opposite to the object,
            // keyed to the appropriate half-axis IDs.
            directionIdByHalfAxisId[oddHalfAxisId] = direction.id
            directionIdByHalfAxisId[oddHalfAxisId + 1] = direction.oppositeid
        }

        // Return the half-axis-IDs/Direction ID mappings object.
        return directionIdByHalfAxisId
    }


    /* Relationship-related attributes. */

    /**
     * Relationship infos.
     * 
     * An array of objects specifying info about each of the Thing's
     * Relationships (ID of the related Thing, ID of the Relationship's
     * Direction, the Relationship's order).
     */
    get relationshipInfos(): RelationshipInfo[] {
        // Construct an array of Relationship infos for each of the Thing's
        // Relationships.
        let relationshipInfos: RelationshipInfo[] = []
        for (const relationship of this.b_relationships) relationshipInfos.push(
            {
                relatedThingId: relationship.thingbid,
                directionId: relationship.direction,
                order: relationship.relationshiporder
            }
        )

        // Remove duplicates from the array.
        relationshipInfos = Array.from(new Set(relationshipInfos))

        // Sort the array by Relationship order.
        relationshipInfos.sort((a, b) => (a.order ? a.order : 0) - (b.order ? b.order : 0))

        // Return the array.
        return relationshipInfos
    }


    /* Related-Thing-related attributes. */

    /**
     * Related Thing IDs.
     * 
     * An array of IDs for related Things, corresponding exactly with the
     * array of Relationship infos.
     */
    get relatedThingIds(): (number | null)[] {
        const relatedThingIds: (number | null)[] = []
        for (const info of this.relationshipInfos) {
            relatedThingIds.push(info.relatedThingId)
        }
        return relatedThingIds
    }

    /**
     * Related Thing IDs by Direction ID.
     * 
     * An object keyed by Direction ID, with each ID corresponding to the IDs
     * of the Things that are related in that Direction.
     */
    get relatedThingIdsByDirectionId(): { [directionId: number]: number[] } {
        // Initialize the empty object.
        const relatedThingIdsByDirectionId: { [directionId: number]: number[] } = {}

        // For each Relationship info,
        for (const info of this.relationshipInfos) {
            // Get the IDs of the Direction and the related Thing.
            const directionId = info.directionId
            const relatedThingId = info.relatedThingId

            // If the Direction ID isn't yet represented in the object, add an
            // empty list under its key.
            if ( !(directionId in relatedThingIdsByDirectionId) ) {
                relatedThingIdsByDirectionId[directionId] = []
            }

            // If the related Thing ID is not null and is not already in the
            // object, add it to the list that corresponds with the Direction
            // ID.
            if (
                relatedThingId !== null
                && !(relatedThingId in relatedThingIdsByDirectionId[directionId])
            ) {
                relatedThingIdsByDirectionId[directionId].push(relatedThingId)
            }
        }

        // Return the object.
        return relatedThingIdsByDirectionId
    }

    /**
     * Non-Cartesian-axis related Thing IDs.
     * 
     * Generates an array of IDs for the related Things that are on non-
     * Cartesian half-axes (half-axes other than 1, 2, 3, 4) in a specified
     * Space.
     * @param space - The Space in which to check.
     * @returns - An array of related Thing IDs.
     */
    nonCartesianAxisRelatedThingIds(space=this.space): number[] {
        // If the specified Space is null, return an empty array.
        if (!space) return []

        // Initialize an empty array for the IDs of Directions on the Thing's
        // non-Cartesian half-axes.
        const nonCartesianAxisDirectionIds: number[] = []

        // For each Direction in the Space that is...
        for (const direction of space.directions.filter(
            direction => {
                // ...on a half-axis...
                return direction.halfaxisid !== null
                // ...but not a *Cartesian* half-axis,
                && !readOnlyArrayToArray(cartesianHalfAxisIds).includes(direction.halfaxisid)
            }
        )) {
            // Add the IDs of the Direction and it's opposite (if applicable)
            // to the array of Direction IDs.
            if (direction.id) nonCartesianAxisDirectionIds.push(direction.id)
            if (direction.oppositeid) nonCartesianAxisDirectionIds.push(direction.oppositeid)
        }

        // Initialize an empty array for the IDs of Things in those Directions.
        const nonCartesianAxisRelatedThingIds: number[] = []

        // For each Direction that has related Things,
        for (const directionId of this.relatedThingDirectionIds) {
            // If the Direction is on a non-Cartesian half-axis,
            if (nonCartesianAxisDirectionIds.includes(directionId) && directionId in this.relatedThingIdsByDirectionId) {
                // Add the IDs of the related Things in that Direction to the
                // array of Thing IDs.
                nonCartesianAxisRelatedThingIds.push(...this.relatedThingIdsByDirectionId[directionId])
            }
        }

        // Return the array of Thing IDs on the non-Cartesian half-axes.
        return nonCartesianAxisRelatedThingIds
    }

    /**
     * Off-axis related Thing IDs.
     * 
     * Generates an array of IDs for the related Things that are not on a
     * half-axis in a specified Space.
     * @param space - The Space in which to check.
     * @returns - An array of related Thing IDs.
     */
    offAxisRelatedThingIds(space=this.space): number[] {
        // If the specified Space is null, return an empty array.
        if (!space) return []

        // Initialize an empty array for the IDs of Directions on the Thing's
        // half-axes.
        const onAxisDirectionIds: number[] = []

        // For each Direction in the Space,
        for (const direction of space.directions) {
            // Add the IDs of the Direction and it's opposite (if applicable)
            // to the array of Direction IDs.
            if (direction.id) onAxisDirectionIds.push(direction.id)
            if (direction.oppositeid) onAxisDirectionIds.push(direction.oppositeid)
        }

        // Initialize an empty array for the IDs of Things in those Directions.
        const offAxisRelatedThingIds: number[] = []

        // For each Direction that has related Things,
        for (const directionId of this.relatedThingDirectionIds) {
            // If the Direction is on a half-axis,
            if (!(onAxisDirectionIds.includes(directionId)) && directionId in this.relatedThingIdsByDirectionId) {
                // Add the IDs of the related Things in that Direction to the
                // array of Thing IDs.
                offAxisRelatedThingIds.push(...this.relatedThingIdsByDirectionId[directionId])
            }
        }

        // Return the array of Thing IDs that are not on half-axes.
        return offAxisRelatedThingIds
    }


    /* Child-Thing-Cohort-related attributes. */

    /**
     * Add/access child Thing Cohort by Direction ID.
     * 
     * Either adds a Thing Cohort, or accesses an existing Thing Cohort, by Direction ID.
     * @param directionID - The ID of the Direction of the Thing Cohort to add or access.
     * @param cohort - The Thing Cohort to add.
     * @returns - The requested Thing Cohort, or null if the Thing Cohort was added.
     */
    childThingCohortByDirectionID( directionId: number ): ThingCohort | null
    childThingCohortByDirectionID( directionId: number, cohort: ThingCohort ): void
    childThingCohortByDirectionID( directionId: number, cohort?: ThingCohort ): ThingCohort | null | void {
        // If this is an access operation, 
        if ( cohort === undefined ) {
            // Return the Thing Cohort corresponding to the specified Direction ID, or null if none.
            return directionId in this.childThingCohortsByDirectionId ? this.childThingCohortsByDirectionId[directionId] : null

        // If this is an add operation,
        } else {
            // Set the child Thing Cohort for the specified Direction.
            this.childThingCohortsByDirectionId[directionId] = cohort
            // Set this Thing as the child Thing Cohort's parent Thing.
            cohort.parentThing = this
        }
    }

    /**
     * Child Thing Cohorts.
     * 
     * An array of all Thing Cohorts which are children of this Thing.
     */
    get childThingCohorts(): ThingCohort[] {
        return Object.values(this.childThingCohortsByDirectionId)
    }

    /**
     * Child Thing Cohort by half-axis ID.
     * 
     * An object mapping the Thing's child Thing Cohorts to the half-axes that
     * they are on.
     */
    get childThingCohortByHalfAxisId(): { [halfAxisId: number]: ThingCohort } {
        // If the Thing's Space is null, return an empty object.
        if (!this.space) return {}

        // Initialize an empty half-axis/Thing-Cohort mappings object.
        const childThingCohortByHalfAxisId: { [halfAxisId: number]: ThingCohort } = {}

        // For each Direction ID/Thing Cohort pair in this Thing's
        // Direction ID/Thing Cohort mapping object,
        for (const [directionId, cohort] of Object.entries(this.childThingCohortsByDirectionId)) {
            // Get the ID of the half-axis that corresponds to that Direction
            // in this Thing's Space.
            const halfAxisId = this.space.halfAxisIdByDirectionId[Number(directionId)]

            // Map the Thing Cohort to that half-axis ID.
            childThingCohortByHalfAxisId[halfAxisId] = cohort
        }

        // Return the half-axis/Thing-Cohort mappings object.
        return childThingCohortByHalfAxisId
    }
}