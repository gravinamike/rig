import { Model } from "objection"
import { v4 as uuidv4 } from "uuid"


/*
 * Relationship model.
 */
export class RelationshipDbModel extends Model {
    static tableName = "relationships" as const

    id!: number
    guid!: string
    thingaid!: number | null
    thingbid!: number | null
    whencreated!: Date | null
    whenmodded!: Date | null
    whentrashed!: Date | null
    text!: string | null
    direction!: number// Default is 1
    meta!: number// Default is 0
    relationshiporder!: number | null
    access!: number | null
    ensystemed!: number | null
}

interface NewRelationshipInfo {
    guid: string,
    thingaid: number,
    thingbid: number,
    whencreated: Date,
    whenmodded: null,
    whentrashed: null,
    text: null,
    direction: number,
    meta: 0,
    relationshiporder: null,
    access: null,
    ensystemed: null
}

export function getNewRelationshipInfo(thingAId: number, thingBId: number, whenCreated: Date, direction: number): NewRelationshipInfo {
    const newRelationshipInfo = {
        guid: uuidv4(),
        thingaid: thingAId,
        thingbid: thingBId,
        whencreated: whenCreated,
        whenmodded: null,
        whentrashed: null,
        text: null,
        direction: direction,
        meta: 0 as const,
        relationshiporder: null,
        access: null,
        ensystemed: null
    }

    return newRelationshipInfo
}