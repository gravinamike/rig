import type { GraphConstruct } from "$lib/shared/constants"
import type { ThingDbModel, ThingSearchListItemDbModel } from "$lib/models/dbModels"
import type { HalfAxisId } from "$lib/shared/constants"
import { oddHalfAxisIds } from "$lib/shared/constants"
import { graphDbModelInStore, getGraphConstructs } from "$lib/stores"
import { Graph, Space, Note, Folder, Relationship, NoteToThing, FolderToThing, ThingCohort } from "$lib/models/constructModels"


type ThingAddress = {
    graph: Graph;
    generationId: number,
    parentThingId: number | null,
    halfAxisId: number | null,
    indexInCohort: number
}

/*
 * Thing model.
 */
export class Thing {
    kind = "thing"

    dbModel: ThingDbModel | null = null

    id: number | null = null
    guid: string | null = null
    text: string | null = null
    whencreated: Date | null = null
    whenmodded: Date | null = null
    whenvisited: Date | null = null
    defaultSpaceId: number | null = null
    perspectivedepths = "{}"// Default is "{}"
    perspectivetexts = "{}"// Default is "{}"

    note: Note | null = null
    folder: Folder | null = null
    a_relationships: Relationship[] = []
    b_relationships: Relationship[] = []
    noteToThing: NoteToThing | null = null
    folderToThing: FolderToThing | null = null

    graph: Graph | null = null
    _parentCohort: ThingCohort | null = null

    inheritSpace = true // For now.
    childCohortsByDirectionId: { [directionId: number]: ThingCohort } = {}

    constructor(dbModel: ThingDbModel | null) {
        if (dbModel) {
            this.dbModel = dbModel

            this.id = Number(dbModel.id)
            this.guid = dbModel.guid
            this.text = dbModel.text
            this.whencreated = dbModel.whencreated ? new Date(dbModel.whencreated): null
            this.whenmodded = dbModel.whenmodded ? new Date(dbModel.whenmodded): null
            this.whenvisited = dbModel.whenvisited ? new Date(dbModel.whenvisited): null
            this.defaultSpaceId = dbModel.defaultplane
            this.perspectivedepths = dbModel.perspectivedepths
            this.perspectivetexts = dbModel.perspectivedepths

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


    setGraph(graph: Graph): void {
        this.graph = graph
    }

    get parentThing(): Thing | null {
        return this._parentCohort?.parentThing || null
    }


    get relationshipInfos(): { relatedThingId: number | null, directionId: number, order: number | null }[] {
        let relationshipInfos: { relatedThingId: number | null, directionId: number, order: number | null }[] = []
        for (const relationship of this.b_relationships) relationshipInfos.push(
            { relatedThingId: relationship.thingbid, directionId: relationship.direction, order: relationship.relationshiporder }
        )
        relationshipInfos = Array.from(new Set(relationshipInfos))
        relationshipInfos.sort((a, b) => (a.order ? a.order : 0) - (b.order ? b.order : 0))
        return relationshipInfos
    }

    get relatedThingIds(): (number | null)[] {
        const relatedThingIds: (number | null)[] = []
        for (const relationshipInfo of this.relationshipInfos) {
            relatedThingIds.push(relationshipInfo.relatedThingId)
        }
        return relatedThingIds
    }

    get relatedThingIdsByDirectionId(): { [directionId: number]: number[] } {
        const relatedThingIdsByDirectionId: { [directionId: number]: number[] } = {}
        for (const relationshipInfo of this.relationshipInfos) {
            const directionId = relationshipInfo.directionId
            const relatedThingId = relationshipInfo.relatedThingId
            if (!(directionId in relatedThingIdsByDirectionId)) relatedThingIdsByDirectionId[directionId] = []
            if (!(relatedThingId === null || relatedThingId in relatedThingIdsByDirectionId[directionId])) relatedThingIdsByDirectionId[directionId].push(relatedThingId)
        }
        return relatedThingIdsByDirectionId
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

    get relatedThingDirectionIds(): number[] {
        const relatedThingDirectionIds = Object.keys(this.relatedThingIdsByDirectionId).map(k => Number(k))
        return relatedThingDirectionIds
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

    offAxisRelatedThingIds(space=this.space): number[] {
        if (!space) return []

        const offAxisRelatedThingIds: number[] = []

        const onAxisDirectionIds: number[] = []

        for (const direction of space.directions) {
            if (direction.id) onAxisDirectionIds.push(direction.id)
            if (direction.oppositeid) onAxisDirectionIds.push(direction.oppositeid)
        }

        for (const directionId of this.relatedThingDirectionIds) {
            if (!(onAxisDirectionIds.includes(directionId))) {
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

    get address(): ThingAddress {
        const address = {
            graph: this.parentCohort.address.graph,
            generationId: this.parentCohort.address.generationId,
            parentThingId: this.parentCohort.address.parentThingId,
            halfAxisId: this.parentCohort.halfAxisId,
            indexInCohort: this.id ? this.parentCohort.indexOfMemberById(this.id) as number : -1
        }
        return address
    }

    get parentCohort(): ThingCohort {
        return this._parentCohort as ThingCohort
    }

    set parentCohort(cohort: ThingCohort) {
        this._parentCohort = cohort
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

    id: number | null
    guid: string | null
    text: string | null

    constructor(dbModel: ThingSearchListItemDbModel) {
        this.dbModel = dbModel

        this.id = dbModel.id
        this.guid = dbModel.guid
        this.text = dbModel.text
    }
}