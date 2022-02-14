import { Model, RelationMappings, RelationMappingsThunk } from "objection"
import { v4 as uuidv4 } from "uuid"
import { Thing } from "$lib/models/dbModels"


/*
 * Folder model.
 */
export class Folder extends Model {
    static tableName = "folders" as const

    id!: number
    whencreated!: Date | null
    path!: string

    static get relationMappings(): RelationMappings | RelationMappingsThunk {
        return {
            things: {
                relation: Model.HasOneThroughRelation,
                modelClass: Thing,
                join: {
                    from: 'folders.id',
                    through: {
                        from: 'foldertothing.folderid',
                        to: 'foldertothing.thingid'
                    },
                    to: 'things.id'
                }
            }
        };
    }
}

interface NewFolderInfo {
    whencreated: string,
    path: string
}

export function getNewNoteInfo(whenCreated: string): NewFolderInfo {
    const newFolderInfo = {
        whencreated: whenCreated,
        path: uuidv4()
    }

    return newFolderInfo
}

/*
 * NoteToThing model.
 */
export class FolderToThing extends Model {
    static tableName = "foldertothing" as const

    id!: number
    folderid!: number
    thingid!: number
}