import type { RelationMappings, RelationMappingsThunk } from "objection"

import { Model } from "objection"
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
    whencreated!: string | null
    whenmodded!: string | null
    whenvisited!: string | null
    defaultplane!: number | null//CAN WE RENAME TO DEFAULTSPACEID?
    perspectivedepths!: string// Default is "{}"
    perspectivetexts!: string// Default is "{}"

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
}

interface NewThingInfo {
    guid: string,
    text: string,
    whencreated: string,
    whenmodded: null,
    whenvisited: null,
    defaultplane: number,
    perspectivedepths: "{}",
    perspectivetexts: "{}"
}

export function getNewThingInfo(text: string, whenCreated: string, defaultSpace: number): NewThingInfo {
    const newThingInfo = {
        guid: uuidv4(),
        text: text,
        whencreated: whenCreated,
        whenmodded: null,
        whenvisited: null,
        defaultplane: defaultSpace,
        perspectivedepths: "{}" as const,
        perspectivetexts: "{}" as const
    }

    return newThingInfo
}


/*
 * Thing search list item.
 */
export class ThingSearchListItemDbModel extends Model {
    static tableName = "things" as const

    id!: number
    guid!: string
    text!: string
}