import type { RelationMappings, RelationMappingsThunk } from "objection"
import type { NoteDbModel, NoteSearchListItemDbModel, NoteToThingDbModel } from "$lib/models/dbModels"

import { Model } from "objection"
import { v4 as uuidv4 } from "uuid"
import { RawThingDbModel } from "$lib/server/models"


/*
 * Note model.
 */
export class RawNoteDbModel extends Model {
    static tableName = "notes" as const

    id!: string | number
    guid!: string
    text!: string
    whencreated!: string | null
    whenmodded!: string | null

    static get relationMappings(): RelationMappings | RelationMappingsThunk {
        return {
            things: {
                relation: Model.HasOneThroughRelation,
                modelClass: RawThingDbModel,
                join: {
                    from: 'notes.id',
                    through: {
                        from: 'notetothing.noteid',
                        to: 'notetothing.thingid'
                    },
                    to: 'things.id'
                }
            }
        };
    }
}



// Necessary to strip out the server-only Objection.js model parts before sending client-side.
export function stripNoteDbModels(models: (RawNoteDbModel | null)[]): (NoteDbModel | null)[] {
    const stripped = []

    for (const model of models) {
        stripped.push(
            model ? {
                id: model.id,
                guid: model.guid,
                text: model.text,
                whencreated: model.whencreated,
                whenmodded: model.whenmodded
            } :
            null
        )
    }

    return stripped
}



interface NewNoteInfo {
    guid: string,
    text: string,
    whencreated: string,
    whenmodded: null
}

export function getNewNoteInfo(whenCreated: string): NewNoteInfo {
    const newThingInfo = {
        guid: uuidv4(),
        text: "",
        whencreated: whenCreated,
        whenmodded: null
    }

    return newThingInfo
}




/*
 * Note search list item.
 */
export class RawNoteSearchListItemDbModel extends Model {
    static tableName = "notes" as const

    id!: number
    guid!: string
    text!: string
    
    noteToThing!: RawNoteToThingDbModel | null

    static get relationMappings(): RelationMappings | RelationMappingsThunk {
        return {
            noteToThing: {
                relation: Model.HasOneRelation,
                modelClass: RawNoteToThingDbModel,
                join: {
                    from: 'notes.id',
                    to: 'notetothing.noteid'
                }
            }
        };
    }
}

// Necessary to strip out the server-only Objection.js model parts before sending client-side.
export function stripNoteSearchListItemDbModels(models: RawNoteSearchListItemDbModel[]): NoteSearchListItemDbModel[] {
    const stripped: NoteSearchListItemDbModel[] = []

    for (const model of models) {
        stripped.push(
            {
                id: model.id,
                guid: model.guid,
                text: model.text,
                thingId: model.noteToThing?.thingid || null
            }
        )
    }

    return stripped
}






/*
 * NoteToThing model.
 */
export class RawNoteToThingDbModel extends Model {
    static tableName = "notetothing" as const

    id!: string | number
    noteid!: number
    thingid!: number
}


// Necessary to strip out the server-only Objection.js model parts before sending client-side.
export function stripNoteToThingDbModels(models: (RawNoteToThingDbModel | null)[]): (NoteToThingDbModel | null)[] {
    const stripped = []

    for (const model of models) {
        stripped.push(
            model ? {
                id: model.id,
                noteid: model.noteid,
                thingid: model.thingid
            } :
            null
        )
    }

    return stripped
}