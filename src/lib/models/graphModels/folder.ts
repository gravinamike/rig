import type { FolderDbModel } from "$lib/models/dbModels"


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

        this.id = dbModel.id
        this.whencreated = dbModel.whencreated
        this.path = dbModel.path
    }
}