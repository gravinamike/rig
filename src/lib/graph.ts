import { Model, RelationMappings, RelationMappingsThunk } from 'objection';
import { spacesStore, thingsStore } from '../routes/__layout.svelte';

// Subscribe to Spaces and Things stores.
let spacesStoreValue: { [id: number]: Space };
spacesStore.subscribe(value => {spacesStoreValue = value});
let thingsStoreValue: { [id: number]: Thing };
thingsStore.subscribe(value => {thingsStoreValue = value});



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



async function querySpaces(spaceIds: number): Promise<null | Space>;
async function querySpaces(spaceIds: number[]): Promise<Space[]>;
async function querySpaces(spaceIds: null, idsToExclude?: number[]): Promise<Space[]>;
async function querySpaces(spaceIds: number | number[] | null, idsToExclude?: number[]): Promise<null | Space | Space[]> {
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


export async function getSpaces(spaceIds: number): Promise<Space | null>;
export async function getSpaces(spaceIds: null): Promise<Space[]>;
export async function getSpaces(spaceIds: number[]): Promise<Space[]>;
export async function getSpaces(spaceIds: number | number[] | null): Promise<Space | Space[] | null> {
    if (spaceIds === null) {
        const retrievedSpaces = Object.values(spacesStoreValue);
        const idsNotToQuery = Object.keys(spacesStoreValue).map(x => Number(x));
        const queriedSpaces = await querySpaces(null, idsNotToQuery);
        for (const queriedSpace of queriedSpaces) {
            // Add the queried Spaces to the Spaces store.
            spacesStoreValue[queriedSpace.id] = queriedSpace;
            spacesStore.set(spacesStoreValue);
        }
        const retrievedAndQueriedSpaces = queriedSpaces.concat(retrievedSpaces);
        return retrievedAndQueriedSpaces;
    } else if (typeof spaceIds === "number") {
        if (spaceIds in spacesStoreValue) {
            // For ids that are represented in the Spaces store, retrieve those Spaces.
            return spacesStoreValue[spaceIds];
        } else {
            // For ids that aren't represented in the Spaces store, query those Spaces.
            const queriedSpace = await querySpaces(spaceIds);
            if (queriedSpace) {
                // Add the queried Spaces to the Spaces store.
                spacesStoreValue[queriedSpace.id] = queriedSpace;
                spacesStore.set(spacesStoreValue);
            }
            return queriedSpace;
        }
    } else {
        // For ids that are represented in the Spaces store, retrieve those Spaces.
        const idsToRetrieve = spaceIds.filter((id: number) => (id in spacesStoreValue));
        const retrievedSpaces: Space[] = [];
        for (const id of idsToRetrieve) {
            retrievedSpaces.push(spacesStoreValue[id]);
        }
        // For ids that aren't represented in the Spaces store, query those Spaces.
        const idsToQuery = spaceIds.filter((id: number) => !(id in spacesStoreValue));
        const queriedSpaces = idsToQuery.length ? await querySpaces(idsToQuery) : [];
        // Add the queried Spaces to the Spaces store.
        for (const queriedSpace of queriedSpaces) {
            spacesStoreValue[queriedSpace.id] = queriedSpace;
            spacesStore.set(spacesStoreValue);
        }
        // Return combined queried and retrieved Spaces (or null if none were found for supplied ids).
        const retrievedAndQueriedSpaces = queriedSpaces.concat(retrievedSpaces);
        return retrievedAndQueriedSpaces;
    }
}


async function queryThings(thingIds: number): Promise<null | Thing>;
async function queryThings(thingIds: number[]): Promise<Thing[]>;
async function queryThings(thingIds: number | number[]): Promise<null | Thing | Thing[]> {
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

export async function getThings(thingIds: number): Promise<Thing | null>;
export async function getThings(thingIds: number[]): Promise<Thing[]>;
export async function getThings(thingIds: number | number[]): Promise<Thing | Thing[] | null> {
    if (typeof thingIds === "number") thingIds = [thingIds];

    // For ids that are represented in the Things store, retrieve those Things.
    const idsToRetrieve = thingIds.filter((id: number) => (id in thingsStoreValue));
    const retrievedThings: Thing[] = [];
    for (const id of idsToRetrieve) {
        retrievedThings.push(thingsStoreValue[id]);
    }

    // For ids that aren't represented in the Things store, query those Things.
    const idsToQuery = thingIds.filter((id: number) => !(id in thingsStoreValue));
    const queriedThings = await queryThings(idsToQuery);

    // Add the queried Things to the Things store.
    for (const queriedThing of queriedThings) {
        thingsStoreValue[queriedThing.id] = queriedThing;
        thingsStore.set(thingsStoreValue);
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
