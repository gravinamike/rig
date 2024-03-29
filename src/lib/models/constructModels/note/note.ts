import type { NoteDbModel, NoteToThingDbModel } from "$lib/models/dbModels"


/*
 * Note model.
 */
export class Note {
    dbModel: NoteDbModel | null

    id: number | null
    guid: string | null
    text: string | null
    whencreated: Date | null
    whenmodded: Date | null

    constructor(dbModel: NoteDbModel) {
        this.dbModel = dbModel

        this.id = Number(dbModel.id)
        this.guid = dbModel.guid
        this.text = dbModel.text
        this.whencreated = dbModel.whencreated ? new Date(dbModel.whencreated): null
        this.whenmodded = dbModel.whenmodded? new Date(dbModel.whenmodded): null
    }
}

/*
 * Note-to-Thing model.
 */
export class NoteToThing {
    dbModel: NoteToThingDbModel | null

    id: number | null
    noteid: number | null
    thingid: number | null

    constructor(dbModel: NoteToThingDbModel) {
        this.dbModel = dbModel

        this.id = Number(dbModel.id)
        this.noteid = dbModel.noteid
        this.thingid = dbModel.thingid
    }
}