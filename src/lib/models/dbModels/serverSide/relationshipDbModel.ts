import type { RelationshipDbModel } from "../clientSide"

import { Model } from "objection"
import { v4 as uuidv4 } from "uuid"


/*
 * Relationship model.
 */
export class RawRelationshipDbModel extends Model {
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

// Necessary to strip out the server-only Objection.js model parts before sending client-side.
export function stripRelationshipDbModels(models: RawRelationshipDbModel[]): RelationshipDbModel[] {
    const stripped = []

    for (const model of models) {
        stripped.push(
            {
                id: model.id,
                guid: model.guid,
                thingaid: model.thingaid,
                thingbid: model.thingbid,
                whencreated: model.whencreated,
                whenmodded: model.whenmodded,
                direction: model.direction,
                relationshiporder: model.relationshiporder
            }
        )
    }

    return stripped
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