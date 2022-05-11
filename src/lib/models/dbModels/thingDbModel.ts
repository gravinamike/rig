import type { GraphConstruct } from "$lib/shared/constants"

import { Model, RelationMappings, RelationMappingsThunk } from "objection"
import { v4 as uuidv4 } from "uuid"
import { RelationshipDbModel, NoteDbModel, NoteToThingDbModel, FolderDbModel, FolderToThingDbModel } from "$lib/models/dbModels"


/*
 * Thing model.
 */
export class ThingDbModel extends Model {
    static tableName = "things" as const

    id!: number
    guid!: string
    text!: string
    whencreated!: Date | null
    whenmodded!: Date | null
    whentrashed!: Date | null
    whenvisited!: Date | null
    defaultplane!: number | null//CAN WE RENAME TO DEFAULTSPACEID?
    depthprofile!: string// Default is "{}"
    formula!: string// Default is "{}"
    lastformulated!: Date | null
    fillcolor!: string | null
    stackbehavior!: string | null
    xoffset!: number | null
    yoffset!: number | null
    zoffset!: number | null
    perspectivedepths!: string// Default is "{}"
    taskactivity!: number | null
    taskactivityreps!: number// Default is 1
    access!: number | null
    perspectivetexts!: string// Default is "{}"
    ensystems!: number | null
    portalperspectivethingid!: number | null
    portaldefaultspaceid!: number | null
    sizemultiplier!: number// Default is 1.0
    perspectiveviewers!: string// Default is "{}"

    note!: NoteDbModel | null
    folder!: FolderDbModel | null
    a_relationships!: RelationshipDbModel[]
    b_relationships!: RelationshipDbModel[]
    noteToThing!: NoteToThingDbModel | null
    folderToThing!: FolderToThingDbModel | null


    static get relationMappings(): RelationMappings | RelationMappingsThunk {
        return {
            note: {
                relation: Model.HasOneThroughRelation,
                modelClass: NoteDbModel,
                join: {
                    from: 'things.id',
                    through: {
                        from: 'notetothing.thingid',
                        to: 'notetothing.noteid'
                    },
                    to: 'notes.id'
                }
            },
            noteToThing: {
                relation: Model.HasOneRelation,
                modelClass: NoteToThingDbModel,
                join: {
                    from: 'things.id',
                    to: 'notetothing.thingid'
                }
            },
            folder: {
                relation: Model.HasOneThroughRelation,
                modelClass: FolderDbModel,
                join: {
                    from: 'things.id',
                    through: {
                        from: 'foldertothing.thingid',
                        to: 'foldertothing.folderid'
                    },
                    to: 'folders.id'
                }
            },
            folderToThing: {
                relation: Model.HasOneRelation,
                modelClass: FolderToThingDbModel,
                join: {
                    from: 'things.id',
                    to: 'foldertothing.thingid'
                }
            },
            a_relationships: {
                relation: Model.HasManyRelation,
                modelClass: RelationshipDbModel,
                join: {
                    from: 'things.id',
                    to: 'relationships.thingbid'
                }
            },
            b_relationships: {
                relation: Model.HasManyRelation,
                modelClass: RelationshipDbModel,
                join: {
                    from: 'things.id',
                    to: 'relationships.thingaid'
                }
            }
        };
    }

    static get virtualAttributes(): string[] {
        return ['relationshipInfos', 'relatedThingIds', 'relatedThingIdsByDirectionId']
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

interface NewThingInfo {
    guid: string,
    text: string,
    whencreated: string,
    whenmodded: null,
    whentrashed: null,
    whenvisited: null,
    defaultplane: number,
    depthprofile: "{}",
    formula: "{}",
    lastformulated: null,
    fillcolor: null,
    stackbehavior: null,
    xoffset: null,
    yoffset: null,
    zoffset: null,
    perspectivedepths: "{}",
    taskactivity: null,
    taskactivityreps: 1,
    access: number | null
    perspectivetexts: "{}",
    ensystems: null,
    portalperspectivethingid: null,
    portaldefaultspaceid: null,
    sizemultiplier: 1,
    perspectiveviewers: "{}"
}

export function getNewThingInfo(text: string, whenCreated: string, defaultSpace: number): NewThingInfo {
    const newThingInfo = {
        guid: uuidv4(),
        text: text,
        whencreated: whenCreated,
        whenmodded: null,
        whentrashed: null,
        whenvisited: null,
        defaultplane: defaultSpace,
        depthprofile: "{}" as const,
        formula: "{}" as const,
        lastformulated: null,
        fillcolor: null,
        stackbehavior: null,
        xoffset: null,
        yoffset: null,
        zoffset: null,
        perspectivedepths: "{}" as const,
        taskactivity: null,
        taskactivityreps: 1 as const,
        access: null,
        perspectivetexts: "{}" as const,
        ensystems: null,
        portalperspectivethingid: null,
        portaldefaultspaceid: null,
        sizemultiplier: 1 as const,
        perspectiveviewers: "{}" as const
    }

    return newThingInfo
}

/*
 * Typeguard functions for Graph construct class.
 */
export function isThing(construct: GraphConstruct): construct is ThingDbModel {
    return "note" in construct
}