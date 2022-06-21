import type { RelationMappings, RelationMappingsThunk } from "objection"

import { Model } from "objection"
import { ThingDbModel } from "$lib/models/dbModels"


/*
 * Folder model.
 */
export class FolderDbModel extends Model {
    static tableName = "folders" as const

    id!: number
    whencreated!: Date | null
    path!: string

    static get relationMappings(): RelationMappings | RelationMappingsThunk {
        return {
            things: {
                relation: Model.HasOneThroughRelation,
                modelClass: ThingDbModel,
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
    whencreated: Date,
    path: string
}

export function getNewFolderInfo(whenCreated: Date, guid: string): NewFolderInfo {
    const newFolderInfo = {
        whencreated: whenCreated,
        path: guid
    }

    return newFolderInfo
}

/*
 * NoteToThing model.
 */
export class FolderToThingDbModel extends Model {
    static tableName = "foldertothing" as const

    id!: number
    folderid!: number
    thingid!: number
}