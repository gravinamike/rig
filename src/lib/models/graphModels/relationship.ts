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
    direction: number// Default is 1
    relationshiporder: number | null

    constructor(dbModel: RelationshipDbModel) {
        this.dbModel = dbModel

        this.id = dbModel.id
        this.guid = dbModel.guid
        this.thingaid = dbModel.thingaid
        this.thingbid = dbModel.thingbid
        this.whencreated = dbModel.whencreated ? new Date(dbModel.whencreated): null
        this.whenmodded = dbModel.whenmodded ? new Date(dbModel.whenmodded): null
        this.direction = dbModel.direction
        this.relationshiporder = dbModel.relationshiporder
    }


    
}