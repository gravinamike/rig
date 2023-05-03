import type { RelationMappings, RelationMappingsThunk } from "objection"
import type { FolderDbModel, FolderToThingDbModel } from "$lib/models/dbModels"

import { Model } from "objection"
import { RawThingDbModel } from "$lib/server/models"


/*
 * Folder model.
 */
export class RawFolderDbModel extends Model {
    static tableName = "folders" as const

    id!: string | number
    whencreated!: string | null
    path!: string

    static get relationMappings(): RelationMappings | RelationMappingsThunk {
        return {
            things: {
                relation: Model.HasOneThroughRelation,
                modelClass: RawThingDbModel,
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


// Necessary to strip out the server-only Objection.js model parts before sending client-side.
export function stripFolderDbModels(models: (RawFolderDbModel | null)[]): (FolderDbModel | null)[] {
    const stripped = []

    for (const model of models) {
        stripped.push(
            model ? {
                id: model.id,
                whencreated: model.whencreated,
                path: model.path
            } :
            null
        )
    }

    return stripped
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
export class RawFolderToThingDbModel extends Model {
    static tableName = "foldertothing" as const

    id!: string | number
    folderid!: number
    thingid!: number
}


// Necessary to strip out the server-only Objection.js model parts before sending client-side.
export function stripFolderToThingDbModels(models: (RawFolderToThingDbModel | null)[]): (FolderToThingDbModel | null)[] {
    const stripped = []

    for (const model of models) {
        stripped.push(
            model ? {
                id: model.id,
                folderid: model.folderid,
                thingid: model.thingid
            } :
            null
        )
    }

    return stripped
}