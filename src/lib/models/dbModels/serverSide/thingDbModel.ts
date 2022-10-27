import type { RelationMappings, RelationMappingsThunk } from "objection"
import { stripRelationshipDbModels } from "./relationshipDbModel"
import type { ThingDbModel, ThingSearchListItemDbModel } from "../clientSide"

import { Model } from "objection"
import { v4 as uuidv4 } from "uuid"
import { RawRelationshipDbModel, RawNoteDbModel, RawNoteToThingDbModel, RawFolderDbModel, RawFolderToThingDbModel } from "$lib/models/dbModels/serverSide"
import { stripFolderDbModels, stripFolderToThingDbModels } from "./folderDbModel"
import { stripNoteDbModels, stripNoteToThingDbModels } from "./noteDbModel"


/*
 * Thing model.
 */
export class RawThingDbModel extends Model {
    static tableName = "things" as const

    id!: string | number
    guid!: string
    text!: string
    whencreated!: string | null
    whenmodded!: string | null
    whenvisited!: string | null
    defaultplane!: number | null//CAN WE RENAME TO DEFAULTSPACEID?
    perspectivedepths!: string// Default is "{}"
    perspectivetexts!: string// Default is "{}"

    note!: RawNoteDbModel | null
    folder!: RawFolderDbModel | null
    a_relationships!: RawRelationshipDbModel[]
    b_relationships!: RawRelationshipDbModel[]
    noteToThing!: RawNoteToThingDbModel | null
    folderToThing!: RawFolderToThingDbModel | null


    static get relationMappings(): RelationMappings | RelationMappingsThunk {
        return {
            note: {
                relation: Model.HasOneThroughRelation,
                modelClass: RawNoteDbModel,
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
                modelClass: RawNoteToThingDbModel,
                join: {
                    from: 'things.id',
                    to: 'notetothing.thingid'
                }
            },
            folder: {
                relation: Model.HasOneThroughRelation,
                modelClass: RawFolderDbModel,
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
                modelClass: RawFolderToThingDbModel,
                join: {
                    from: 'things.id',
                    to: 'foldertothing.thingid'
                }
            },
            a_relationships: {
                relation: Model.HasManyRelation,
                modelClass: RawRelationshipDbModel,
                join: {
                    from: 'things.id',
                    to: 'relationships.thingbid'
                }
            },
            b_relationships: {
                relation: Model.HasManyRelation,
                modelClass: RawRelationshipDbModel,
                join: {
                    from: 'things.id',
                    to: 'relationships.thingaid'
                }
            }
        };
    }
}


// Necessary to strip out the server-only Objection.js model parts before sending client-side.
export function stripThingDbModels(models: RawThingDbModel[]): ThingDbModel[] {
    const stripped: ThingDbModel[] = []

    for (const model of models) {
        stripped.push(
            {
                id: model.id,
                guid: model.guid,
                text: model.text,
                whencreated: model.whencreated,
                whenmodded: model.whenmodded,
                whenvisited: model.whenvisited,
                defaultplane: model.defaultplane,
                perspectivedepths: model.perspectivedepths,
                perspectivetexts: model.perspectivetexts,

                note: stripNoteDbModels([model.note])[0],
                folder: stripFolderDbModels([model.folder])[0],
                a_relationships: stripRelationshipDbModels(model.a_relationships),
                b_relationships: stripRelationshipDbModels(model.b_relationships),
                noteToThing: stripNoteToThingDbModels([model.noteToThing])[0],
                folderToThing: stripFolderToThingDbModels([model.folderToThing])[0]
            }
        )
    }

    return stripped
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
export class RawThingSearchListItemDbModel extends Model {
    static tableName = "things" as const

    id!: number
    guid!: string
    text!: string
}

// Necessary to strip out the server-only Objection.js model parts before sending client-side.
export function stripThingSearchListItemDbModels(models: RawThingSearchListItemDbModel[]): ThingSearchListItemDbModel[] {
    const stripped: ThingSearchListItemDbModel[] = []

    for (const model of models) {
        stripped.push(
            {
                id: model.id,
                guid: model.guid,
                text: model.text
            }
        )
    }

    return stripped
}