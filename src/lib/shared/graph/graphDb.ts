import { HalfAxisId, oddHalfAxisIds } from "$lib/shared/graph/graph"
import { Model, RelationMappings, RelationMappingsThunk } from "objection"


// Direction model.
export class Direction extends Model {
    id!: number
    oppositeid!: number | null
    text!: string | null
    nameforobjects!: string | null
    spaces!: Space[]

    static tableName = 'directions'

    static get relationMappings(): RelationMappings | RelationMappingsThunk {
        return {
            spaces: {
                relation: Model.ManyToManyRelation,
                modelClass: Space,
                join: {
                    from: 'directions.id',
                    through: {
                        from: 'directiontospace.directionid',
                        to: 'directiontospace.spaceid'
                    },
                    to: 'spaces.id'
                }
            }
        };
    }
}

// Space model.
export class Space extends Model {
    id!: number
    text!: string | null
    directions!: Direction[]

    static tableName = 'spaces'

    static get relationMappings(): RelationMappings | RelationMappingsThunk {
        return {
            directions: {
                relation: Model.ManyToManyRelation,
                modelClass: Direction,
                join: {
                    from: 'spaces.id',
                    through: {
                        from: 'directiontospace.spaceid',
                        to: 'directiontospace.directionid'
                    },
                    to: 'directions.id'
                }
            }
        };
    }

    static get virtualAttributes(): string[] {
        return ['directionIdByHalfAxisId', 'halfAxisIdByDirectionId']
    }

    get directionIdByHalfAxisId(): { [halfAxisId: number]: number | null } {
        const directionIdsByHalfAxisIds: { [halfAxisId: number]: number | null } = {}
        for (const oddHalfAxisId of oddHalfAxisIds) {
            const directionIndex = (oddHalfAxisId - 1) / 2
            if (directionIndex < this.directions.length) {
                const direction = this.directions[directionIndex]
                directionIdsByHalfAxisIds[oddHalfAxisId] = direction.id
                directionIdsByHalfAxisIds[oddHalfAxisId + 1] = direction.oppositeid
            }
        }
        return directionIdsByHalfAxisIds
    }

    get halfAxisIdByDirectionId(): { [directionId: number]: HalfAxisId | null } {
        const halfAxisIdByDirectionId: { [directionId: number]: HalfAxisId | null } = {}
        const halfAxisIds = Object.keys(this.directionIdByHalfAxisId).map(k => Number(k) as HalfAxisId)
        for (const halfAxisId of halfAxisIds) {
            const directionId = this.directionIdByHalfAxisId[halfAxisId]
            if (directionId) halfAxisIdByDirectionId[directionId] = halfAxisId
        }
        return halfAxisIdByDirectionId
    }
}

// Relationship model.
class Relationship extends Model {
    id!: number
    direction!: number
    thingaid!: number
    thingbid!: number

    static tableName = 'relationships'
}

// Thing model.
export class Thing extends Model {
    kind = 'thing'

    id!: number
    text!: string
    note!: Note | null
    defaultplane!: number | null//CAN WE RENAME TO DEFAULTSPACEID?
    a_relationships!: Relationship[]
    b_relationships!: Relationship[]

    static tableName = 'things'

    static get relationMappings(): RelationMappings | RelationMappingsThunk {
        return {
            a_relationships: {
                relation: Model.HasManyRelation,
                modelClass: Relationship,
                join: {
                    from: 'things.id',
                    to: 'relationships.thingbid'
                }
            },
            b_relationships: {
                relation: Model.HasManyRelation,
                modelClass: Relationship,
                join: {
                    from: 'things.id',
                    to: 'relationships.thingaid'
                }
            },
            note: {
                relation: Model.HasOneThroughRelation,
                modelClass: Note,
                join: {
                    from: 'things.id',
                    through: {
                        from: 'notetothing.thingid',
                        to: 'notetothing.noteid'
                    },
                    to: 'notes.id'
                }
            }
        };
    }

    static get virtualAttributes(): string[] {
        return ['relationshipInfos', 'relatedThingIds', 'relatedThingIdsByDirectionId']
    }

    get relationshipInfos(): { relatedThingId: number, directionId: number }[] {
        let relationshipInfos: { relatedThingId: number, directionId: number }[] = []
        /*for (const relationship of this.a_relationships) relationshipInfos.push(
            { relatedThingId: relationship.thingaid, directionId: relationship.direction }
        )*/
        for (const relationship of this.b_relationships) relationshipInfos.push(
            { relatedThingId: relationship.thingbid, directionId: relationship.direction }
        )
        relationshipInfos = Array.from(new Set(relationshipInfos))
        return relationshipInfos
    }

    get relatedThingIds(): number[] {
        const relatedThingIds: number[] = []
        for (const relationshipInfo of this.relationshipInfos) {
            relatedThingIds.push(relationshipInfo.relatedThingId)
        }
        return relatedThingIds
    }

    get relatedThingIdsByDirectionId(): { [directionId: number]: number[] } {
        const relatedThingIdsByDirectionId: { [directionId: number]: number[] } = {}
        for (const relationshipInfo of this.relationshipInfos) {
            const directionId = relationshipInfo.directionId
            const relatedThingId = relationshipInfo.relatedThingId
            if (!(directionId in relatedThingIdsByDirectionId)) relatedThingIdsByDirectionId[directionId] = []
            if (!(relatedThingId in relatedThingIdsByDirectionId[directionId])) relatedThingIdsByDirectionId[directionId].push(relatedThingId)
        }
        return relatedThingIdsByDirectionId
    }
}

// Note model.
export class Note extends Model {
    text!: string

    static tableName = 'notes'

    static get relationMappings(): RelationMappings | RelationMappingsThunk {
        return {
            things: {
                relation: Model.HasOneThroughRelation,
                modelClass: Thing,
                join: {
                    from: 'notes.id',
                    through: {
                        from: 'notetothing.noteid',
                        to: 'notetothing.thingid'
                    },
                    to: 'things.id'
                }
            }
        };
    }
}


// Functions to query Graph constructs.
export async function querySpaces(spaceIds: number): Promise<null | Space>;
export async function querySpaces(spaceIds: number[]): Promise<Space[]>;
export async function querySpaces(spaceIds: null, idsToExclude?: number[]): Promise<Space[]>;
export async function querySpaces(spaceIds: number | number[] | null, idsToExclude?: number[]): Promise<null | Space | Space[]> {
    if (typeof spaceIds === "number") {
        const queriedSpaces = await Space.query()
            .where("id", spaceIds)
            .allowGraph('directions')
            .withGraphFetched('directions')
            .orderBy('id');
            //.debug();
        return queriedSpaces.length ? queriedSpaces[0] : null;
    } else if (spaceIds === null) {
        if (!idsToExclude) {
            const queriedSpaces = await Space.query()
                .allowGraph('directions')
                .withGraphFetched('directions')
                .orderBy('id');
                //.debug();
            return queriedSpaces;
        } else {
            const queriedSpaces = await Space.query()
                .where(
                    (builder) => builder.whereNotIn('id', idsToExclude)
                )
                .allowGraph('directions')
                .withGraphFetched('directions')
                .orderBy('id');
                //.debug();
            return queriedSpaces;
        }
    } else if (spaceIds.length) {
        const queriedSpaces = await Space.query()
            .where(
                (builder) => builder.whereIn('id', spaceIds)
            )
            .allowGraph('directions')
            .withGraphFetched('directions')
            .orderBy('id');
            //.debug();
        return queriedSpaces;
    } else {
        const queriedSpaces = await Space.query()
            .allowGraph('directions')
            .withGraphFetched('directions')
            .orderBy('id');
            //.debug();
        return queriedSpaces;
    }
}

export async function queryThings(thingIds: number): Promise<null | Thing>;
export async function queryThings(thingIds: number[]): Promise<Thing[]>;
export async function queryThings(thingIds: number | number[]): Promise<null | Thing | Thing[]> {
    if (typeof thingIds === "number") {
        const queriedThings = await Thing.query()
            .where("id", thingIds)
            .allowGraph('[a_relationships, b_relationships, note]')
            .withGraphFetched('[a_relationships, b_relationships, note]')
            .orderBy('id');
            //.debug();
        return queriedThings.length ? queriedThings[0] : null;
    } else {
        const queriedThings = await Thing.query()
            .where(
                (builder) => builder.whereIn('id', thingIds)
            )
            .allowGraph('[a_relationships, b_relationships, note]')
            .withGraphFetched('[a_relationships, b_relationships, note]')
            .orderBy('id');
            //.debug();
        return queriedThings;
    }
}