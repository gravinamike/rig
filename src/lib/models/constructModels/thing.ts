// Import types.
import type { HalfAxisId, GraphConstruct } from "$lib/shared/constants"
import type { ThingDbModel, ThingSearchListItemDbModel } from "../dbModels/clientSide"

// Import constants and stores.
import { oddHalfAxisIds } from "$lib/shared/constants"
import { graphDbModelInStore, getGraphConstructs } from "$lib/stores"

// Import Graph constructs.
import { Graph, Space, Note, Folder, Relationship, NoteToThing, FolderToThing, ThingCohort } from "$lib/models/constructModels"


/**
 * Thing address.
 * 
 * Type for an object that specifies a Thing's unique position in its Graph.
 */
type ThingAddress = {
    graph: Graph;
    generationId: number,
    parentThingId: number | null,
    halfAxisId: number | null,
    indexInCohort: number
}

interface RelationshipInfo {
    relatedThingId: number | null,
    directionId: number,
    order: number | null
}

/*
 * Thing model.
 *
 * Class representing the defining attributes of a Thing. Generally derived
 * from the database model equivalent, ThingDbModel.
 */
export class Thing {
    kind = "thing"

    dbModel: ThingDbModel | null = null

    // Intrinsic attributes.
    id: number | null = null
    guid: string | null = null
    text: string | null = null
    whencreated: Date | null = null
    whenmodded: Date | null = null
    whenvisited: Date | null = null
    defaultSpaceId: number | null = null
    perspectivedepths = "{}"// Default is "{}"
    perspectivetexts = "{}"// Default is "{}"
    inheritSpace = true // For now; will be stored in db in the future.

    // Structures that the Thing is part of.
    graph: Graph | null = null
    parentCohort: ThingCohort | null = null

    // Related structures, specified by the database.
    note: Note | null = null
    folder: Folder | null = null
    a_relationships: Relationship[] = []
    b_relationships: Relationship[] = []
    noteToThing: NoteToThing | null = null
    folderToThing: FolderToThing | null = null

    // Related structures, derived during build.
    childCohortsByDirectionId: { [directionId: number]: ThingCohort } = {}


    /**
     * Create a Thing.
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
            this.folder = dbModel.folder ? new Folder(dbModel.folder) : null     
            for (const relationshipDbModel of dbModel.a_relationships) {
                this.a_relationships.push( new Relationship(relationshipDbModel) )
            }
            for (const relationshipDbModel of dbModel.b_relationships) {
                this.b_relationships.push( new Relationship(relationshipDbModel) )
            }
            this.noteToThing = dbModel.noteToThing ? new NoteToThing(dbModel.noteToThing) : null
            this.folderToThing = dbModel.folderToThing ? new FolderToThing(dbModel.folderToThing) : null
        }
    }


    /**
     * Parent Thing.
     * 
     * The Thing that this Thing is a child of (or null if there is none).
     */
    get parentThing(): Thing | null {
        return this.parentCohort?.parentThing || null
    }

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





    get relatedThingDirectionIds(): number[] {
        const relatedThingDirectionIds = Object.keys(this.relatedThingIdsByDirectionId).map(k => Number(k))
        return relatedThingDirectionIds
    }




    get space(): Space | null {
        if (!this.graph) {

            return null

        } else {

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
                && (
                    // ... and the Thing Widget Model has a default Space set,
                    this.defaultSpaceId
                    // ... and that default Space is in the Store,
                    && graphDbModelInStore("Space", this.defaultSpaceId)
                )
            ) {
                // ...use the Thing Widget Model's own default Space.
                space = getGraphConstructs<Space>("Space", this.defaultSpaceId) as Space

            // Else, if the Thing Widget model has a parent, inherit the parent's Space.
            } else if (this.parentThing) {
                space = this.parentThing.space

            // If all else fails, just use the first Space in the list of Spaces.
            } else {
                space = getGraphConstructs<Space>("Space", 1) as Space//What if there is no spacesStoreValue[1]? Supply an empty Space.
            }

            return space

        }
    }

    

    childThingCohort( directionId: number ): ThingCohort | null
    childThingCohort( directionId: number, cohort: ThingCohort ): void
    childThingCohort( directionId: number, cohort?: ThingCohort ): ThingCohort | null | void {
        if ( cohort === undefined ) {
            return directionId in this.childCohortsByDirectionId ? this.childCohortsByDirectionId[directionId] : null
        } else {
            // Set child Thing Cohort for this Direction.
            this.childCohortsByDirectionId[directionId] = cohort
            cohort.parentThing = this
        }
    }

    get childThingCohorts(): ThingCohort[] {
        return Object.values(this.childCohortsByDirectionId)
    }



    nonCartesianAxisRelatedThingIds(space=this.space): number[] {
        if (!space) return []

        const nonCartesianAxisRelatedThingIds: number[] = []

        const nonCartesianAxisDirectionIds: number[] = []

        for (const direction of space.directions.filter(
            direction => {
                return direction.halfaxisid !== null
                && ![1, 2, 3, 4].includes(direction.halfaxisid)
            }
        )) {
            if (direction.id) nonCartesianAxisDirectionIds.push(direction.id)
            if (direction.oppositeid) nonCartesianAxisDirectionIds.push(direction.oppositeid)
        }

        for (const directionId of this.relatedThingDirectionIds) {
            if (nonCartesianAxisDirectionIds.includes(directionId) && directionId in this.relatedThingIdsByDirectionId) {
                nonCartesianAxisRelatedThingIds.push(...this.relatedThingIdsByDirectionId[directionId])
            }
        }
        return nonCartesianAxisRelatedThingIds
    }





    offAxisRelatedThingIds(space=this.space): number[] {
        if (!space) return []

        const offAxisRelatedThingIds: number[] = []

        const onAxisDirectionIds: number[] = []

        for (const direction of space.directions) {
            if (direction.id) onAxisDirectionIds.push(direction.id)
            if (direction.oppositeid) onAxisDirectionIds.push(direction.oppositeid)
        }

        for (const directionId of this.relatedThingDirectionIds) {
            if (!(onAxisDirectionIds.includes(directionId)) && directionId in this.relatedThingIdsByDirectionId) {
                offAxisRelatedThingIds.push(...this.relatedThingIdsByDirectionId[directionId])
            }
        }
        return offAxisRelatedThingIds
    }

    get relatedThingHalfAxisIds(): Set<HalfAxisId> {
        const relatedThingHalfAxisIds: Set<HalfAxisId> = new Set()
        if (this.space) {
            for (const directionID of this.relatedThingDirectionIds) {
                const halfAxisId = this.space.halfAxisIdByDirectionId[directionID]
                if (halfAxisId) relatedThingHalfAxisIds.add(halfAxisId)
            }
        }
        return relatedThingHalfAxisIds
    }
    
    get directionIdByHalfAxisId(): { [halfAxisId: number]: number | null } {
        const directionIdByHalfAxisId: { [halfAxisId: number]: number | null } = {}
        if (this.space) {
            for (const oddHalfAxisId of oddHalfAxisIds) {
                const direction = this.space.directions[(oddHalfAxisId - 1)/2];
                directionIdByHalfAxisId[oddHalfAxisId] = direction.id;
                directionIdByHalfAxisId[oddHalfAxisId + 1] = direction.oppositeid;
            }
        }
        return directionIdByHalfAxisId
    }

    get address(): ThingAddress | null {
        if (!this.id || !this.parentCohort) return null
        const address = {
            graph: this.parentCohort.address.graph,
            generationId: this.parentCohort.address.generationId,
            parentThingId: this.parentCohort.address.parentThingId,
            halfAxisId: this.parentCohort.halfAxisId,
            indexInCohort: this.parentCohort.indexOfMemberById(this.id) || -1
        }
        return address
    }

    get childCohorts(): ThingCohort[] {
        return Object.values(this.childCohortsByDirectionId)
    }

    get childCohortsByHalfAxisId(): { [halfAxisId: number]: ThingCohort } {
        const childCohortsByHalfAxisId: { [halfAxisId: number]: ThingCohort } = {}
        for (const [directionId, cohort] of Object.entries(this.childCohortsByDirectionId)) {
            const halfAxisId = (this.space as Space).halfAxisIdByDirectionId[Number(directionId)]
            childCohortsByHalfAxisId[halfAxisId] = cohort
        }
        return childCohortsByHalfAxisId
    }
}

/*
 * Typeguard functions for Graph construct class.
 */
export function isThing(construct: GraphConstruct): construct is Thing {
    return "note" in construct
}


/*
 * Thing search list item.
 */
export class ThingSearchListItem {
    dbModel: ThingSearchListItemDbModel | null

    id: number
    guid: string | null
    text: string | null

    constructor(dbModel: ThingSearchListItemDbModel) {
        this.dbModel = dbModel

        this.id = Number(dbModel.id)
        this.guid = dbModel.guid
        this.text = dbModel.text
    }
}