import type { RelationMappings, RelationMappingsThunk } from "objection"

import { Model } from "objection"
import { ThingDbModel } from "$lib/models/dbModels"


/*
 * Folder model.
 */
export class FolderDbModel extends Model {
    static tableName = "folders" as const

    id!: string | number
    whencreated!: string | null
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
    whencreated: string,
    path: string
}

export function getNewFolderInfo(whenCreated: string, guid: string): NewFolderInfo {
    const newFolderInfo = {
        whencreated: whenCreated,
        path: guid
    }

    return newFolderInfo
}

/*
 * FolderToThing model.
 */
export class FolderToThingDbModel extends Model {
    static tableName = "foldertothing" as const

    id!: string | number
    folderid!: number
    thingid!: number
}