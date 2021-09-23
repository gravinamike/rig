import { Model, RelationMappings, RelationMappingsThunk } from 'objection';
import { things } from '../__layout.svelte';


// Thing model.
export class Thing extends Model {
    id!: number
    text!: string
    note!: Note | null
    defaultplane!: number | null//CAN WE RENAME TO DEFAULTSPACE?
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


// Relationship model.
class Relationship extends Model {
    static tableName = 'relationships'

    static get relationMappings(): RelationMappings | RelationMappingsThunk {
        return {
            things: {
                relation: Model.HasOneRelation,
                modelClass: Thing,
                join: {
                    from: 'relationships.thingbid',//NOTE THIS IS ONLY HALF THE RELATIONSHIPS...
                    to: 'things.id'
                }
            }
        };
    }
}


// Notes model.
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


let thingsValue: { [id: number]: Thing };//Rename thingsValue
things.subscribe(value => {
    thingsValue = value;
});

async function queryThings(thingIds: number): Promise<null | Thing>;
async function queryThings(thingIds: number[]): Promise<Thing[]>;
async function queryThings(thingIds: number | number[]): Promise<null | Thing | Thing[]> {
    if (typeof thingIds === "number") {
        const queriedThings = await Thing.query()
            .where("id", thingIds)
            .allowGraph('[a_relations, b_relations, note]')
            .withGraphFetched('[a_relations, b_relations, note]')
            .orderBy('id')
            .debug();
        //console.log(queriedThings);
        return queriedThings.length ? queriedThings[0] : null;
    } else {
        const queriedThings = await Thing.query()
            .where(
                (builder) => builder.whereIn('id', thingIds)
            )
            .allowGraph('[a_relations, b_relations, note]')
            .withGraphFetched('[a_relations, b_relations, note]')
            .orderBy('id')
            .debug();
        //console.log(queriedThings);
        return queriedThings;
    }
}

export async function getThings(thingIds: number): Promise<Thing | null>;
export async function getThings(thingIds: number[]): Promise<Thing[]>;
export async function getThings(thingIds: number | number[]): Promise<Thing | Thing[] | null> {
    if (typeof thingIds === "number") thingIds = [thingIds];

    // For ids that are represented in the Things store, retrieve those Things.
    const idsToRetrieve = thingIds.filter((id: number) => (id in thingsValue));
    const retrievedThings: Thing[] = [];
    for (const id of idsToRetrieve) {
        retrievedThings.push(thingsValue[id]);
    }

    // For ids that aren't represented in the Things store, query those Things.
    const idsToQuery = thingIds.filter((id: number) => !(id in thingsValue));
    const queriedThings = await queryThings(idsToQuery);

    // Add the queried Things to the Things store.
    for (const queriedThing of queriedThings) {
        thingsValue[queriedThing.id] = queriedThing;
        things.set(thingsValue);
    }

    // Return combined queried and retrieved Things (or null if none were found for supplied ids).
    const retrievedAndQueriedThings = queriedThings.concat(retrievedThings);
    if (thingIds.length) {
        if (typeof thingIds === "number") {
            return retrievedAndQueriedThings[0];
        } else {
            return retrievedAndQueriedThings;
        }
    } else {
        return null
    }
}



// HERE CREATE A CLEARTHINGS METHOD, TO BE USED WHEN REFRESHING THE GRAPH
