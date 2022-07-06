import type { GraphConstruct } from "$lib/shared/constants"
import type { ThingDbModel, ThingSearchListItemDbModel } from "$lib/models/dbModels"
import { Note, Folder, Relationship, NoteToThing, FolderToThing } from "$lib/models/graphModels"


/*
 * Thing model.
 */
export class Thing {
    dbModel: ThingDbModel | null

    id: number | null
    guid: string | null
    text: string | null
    whencreated: Date | null
    whenmodded: Date | null
    whentrashed: Date | null
    whenvisited: Date | null
    defaultplane: number | null
    depthprofile: string// Default is "{}"
    formula: string// Default is "{}"
    lastformulated: Date | null
    fillcolor: string | null
    stackbehavior: string | null
    xoffset: number | null
    yoffset: number | null
    zoffset: number | null
    perspectivedepths: string// Default is "{}"
    taskactivity: number | null
    taskactivityreps: number// Default is 1
    access: number | null
    perspectivetexts: string// Default is "{}"
    ensystems: number | null
    portalperspectivethingid: number | null
    portaldefaultspaceid: number | null
    sizemultiplier: number// Default is 1.0
    perspectiveviewers: string// Default is "{}"

    note: Note | null
    folder: Folder | null
    a_relationships: Relationship[] = []
    b_relationships: Relationship[] = []
    noteToThing: NoteToThing | null
    folderToThing: FolderToThing | null

    constructor(dbModel: ThingDbModel) {
        this.dbModel = dbModel

        this.id = dbModel.id
        this.guid = dbModel.guid
        this.text = dbModel.text
        this.whencreated = dbModel.whencreated
        this.whenmodded = dbModel.whenmodded
        this.whentrashed = dbModel.whentrashed
        this.whenvisited = dbModel.whenvisited
        this.defaultplane = dbModel.defaultplane
        this.depthprofile = dbModel.depthprofile
        this.formula = dbModel.formula
        this.lastformulated = dbModel.lastformulated
        this.fillcolor = dbModel.fillcolor
        this.stackbehavior = dbModel.stackbehavior
        this.xoffset = dbModel.xoffset
        this.yoffset = dbModel.yoffset
        this.zoffset = dbModel.zoffset
        this.perspectivedepths = dbModel.perspectivedepths
        this.taskactivity = dbModel.taskactivity
        this.taskactivityreps = dbModel.taskactivityreps
        this.access = dbModel.access
        this.perspectivetexts = dbModel.perspectivedepths
        this.ensystems = dbModel.ensystems
        this.portalperspectivethingid = dbModel.portaldefaultspaceid
        this.portaldefaultspaceid = dbModel.portaldefaultspaceid
        this.sizemultiplier = dbModel.sizemultiplier
        this.perspectiveviewers = dbModel.perspectiveviewers

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