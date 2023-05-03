// Import types.
import type { ThingSearchListItemDbModel } from "$lib/models/dbModels"


/*
 * Thing search list item.
 */
export class ThingSearchListItem {
    dbModel: ThingSearchListItemDbModel | null

    id: number
    guid: string | null
    text: string | null

    /**
     * Create a Thing search list item.
     * @param dbModel - The database model that the Thing search list item is derived from.
     */
    constructor(dbModel: ThingSearchListItemDbModel) {
        this.dbModel = dbModel

        // Copy or adapt attributes from the ThingDbModel.
        this.id = Number(dbModel.id)
        this.guid = dbModel.guid
        this.text = dbModel.text
    }
}