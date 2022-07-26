import { Model } from "objection"
import { v4 as uuidv4 } from "uuid"


/*
 * Relationship model.
 */
export class RelationshipDbModel extends Model {
    static tableName = "relationships" as const

    id!: string | number
    guid!: string
    thingaid!: number | null
    thingbid!: number | null
    whencreated!: string | null
    whenmodded!: string | null
    direction!: number// Default is 1
    relationshiporder!: number | null
}

interface NewRelationshipInfo {
    guid: string,
    thingaid: number,
    thingbid: number,
    whencreated: string,
    whenmodded: null,
    direction: number,
    relationshiporder: null
}

export function getNewRelationshipInfo(thingAId: number, thingBId: number, whenCreated: string, direction: number): NewRelationshipInfo {
    const newRelationshipInfo = {
        guid: uuidv4(),
        thingaid: thingAId,
        thingbid: thingBId,
        whencreated: whenCreated,
        whenmodded: null,
        direction: direction,
        relationshiporder: null
    }

    return newRelationshipInfo
}