import type { FolderDbModel, FolderToThingDbModel } from "$lib/models/dbModels"



/*
 * Folder model.
 */
export class Folder {
    dbModel: FolderDbModel | null

    id: number | null
    whencreated: Date | null
    path: string

    constructor(dbModel: FolderDbModel) {
        this.dbModel = dbModel

        this.id = Number(dbModel.id)
        this.whencreated = dbModel.whencreated ? new Date(dbModel.whencreated): null
        this.path = dbModel.path
    }
}


/*
 * Folder-to-Thing model.
 */
export class FolderToThing {
    dbModel: FolderToThingDbModel | null

    id: number | null
    folderid: number | null
    thingid: number | null

    constructor(dbModel: FolderToThingDbModel) {
        this.dbModel = dbModel

        this.id = Number(dbModel.id)
        this.folderid = dbModel.folderid
        this.thingid = dbModel.thingid
    }
}