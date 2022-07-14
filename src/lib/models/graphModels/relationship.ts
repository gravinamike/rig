import type { RelationshipDbModel } from "$lib/models/dbModels"


/*
 * Relationship model.
 */
export class Relationship {
    dbModel: RelationshipDbModel | null

    id: number | null
    guid: string | null
    thingaid: number | null
    thingbid: number | null
    whencreated: Date | null
    whenmodded: Date | null
    whentrashed: Date | null
    text: string | null
    direction: number// Default is 1
    meta: number// Default is 0
    relationshiporder: number | null
    access: number | null
    ensystemed: number | null

    constructor(dbModel: RelationshipDbModel) {
        this.dbModel = dbModel

        this.id = dbModel.id
        this.guid = dbModel.guid
        this.thingaid = dbModel.thingaid
        this.thingbid = dbModel.thingbid
        this.whencreated = dbModel.whencreated ? new Date(dbModel.whencreated): null
        this.whenmodded = dbModel.whenmodded ? new Date(dbModel.whenmodded): null
        this.whentrashed = dbModel.whentrashed ? new Date(dbModel.whentrashed): null
        this.text = dbModel.text
        this.direction = dbModel.direction
        this.meta = dbModel.meta
        this.relationshiporder = dbModel.relationshiporder
        this.access = dbModel.access
        this.ensystemed = dbModel.ensystemed
    }


    
}