import { Model, RelationMappings, RelationMappingsThunk } from "objection"
import { v4 as uuidv4 } from "uuid"
import { ThingDbModel } from "$lib/models/dbModels"


/*
 * Note model.
 */
export class NoteDbModel extends Model {
    static tableName = "notes" as const

    id!: number
    guid!: string
    text!: string
    whencreated!: Date | null
    whenmodded!: Date | null

    static get relationMappings(): RelationMappings | RelationMappingsThunk {
        return {
            things: {
                relation: Model.HasOneThroughRelation,
                modelClass: ThingDbModel,
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
 * NoteToThing model.
 */
export class NoteToThingDbModel extends Model {
    static tableName = "notetothing" as const

    id!: number
    noteid!: number
    thingid!: number
}