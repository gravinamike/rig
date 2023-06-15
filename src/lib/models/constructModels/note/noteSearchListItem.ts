// Import types.
import type { NoteSearchListItemDbModel } from "$lib/models/dbModels"


/*
 * Note search list item.
 */
export class NoteSearchListItem {
    dbModel: NoteSearchListItemDbModel | null

    id: number
    guid: string | null
    text: string | null
    thingId: number | null
    thingText: string | null

    /**
     * Create a Note search list item.
     * @param dbModel - The database model that the Note search list item is derived from.
     */
    constructor(dbModel: NoteSearchListItemDbModel) {
        this.dbModel = dbModel

        // Copy or adapt attributes from the NoteDbModel.
        this.id = Number(dbModel.id)
        this.guid = dbModel.guid
        this.text = dbModel.text
        this.thingId = dbModel.thingId
        this.thingText = dbModel.thingText
    }
}