import { Model, RelationMappings, RelationMappingsThunk } from 'objection';


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
}

// Relationship model.
class Relationship extends Model {
    static tableName = 'relationships'
}

// Thing model.
export class Thing extends Model {
    id!: number
    text!: string
    note!: Note | null
    defaultplane!: number | null//CAN WE RENAME TO DEFAULTSPACEID?
    a_relations!: Thing[]
    b_relations!: Thing[]
    relationshipDirection: number | null = null
    relationshipThingAId: number | null = null
    relationshipThingBId: number | null = null

    static tableName = 'things'

    static get relationMappings(): RelationMappings | RelationMappingsThunk {
        return {
            a_relations: {
                relation: Model.ManyToManyRelation,
                modelClass: Thing,
                join: {
                    from: 'things.id',
                    through: {
                        from: 'relationships.thingbid',
                        to: 'relationships.thingaid',
                        modelClass: Relationship,
                        extra: {
                            relationship_direction: 'direction',
                            relationship_thing_a_id: 'thingaid',
                            relationship_thing_b_id: 'thingbid'
                        }
                    },
                    to: 'things.id'
                }
            },
            b_relations: {
                relation: Model.ManyToManyRelation,
                modelClass: Thing,
                join: {
                    from: 'things.id',
                    through: {
                        from: 'relationships.thingaid',
                        to: 'relationships.thingbid',
                        modelClass: Relationship,
                        extra: {
                            direction: 'direction',
                            relationship_thing_a_id: 'thingaid',
                            relationship_thing_b_id: 'thingbid'
                        }
                    },
                    to: 'things.id'
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
            .allowGraph('[a_relations, b_relations, note]')
            .withGraphFetched('[a_relations, b_relations, note]')
            .orderBy('id');
            //.debug();
        return queriedThings.length ? queriedThings[0] : null;
    } else {
        const queriedThings = await Thing.query()
            .where(
                (builder) => builder.whereIn('id', thingIds)
            )
            .allowGraph('[a_relations, b_relations, note]')
            .withGraphFetched('[a_relations, b_relations, note]')
            .orderBy('id');
            //.debug();
        return queriedThings;
    }
}