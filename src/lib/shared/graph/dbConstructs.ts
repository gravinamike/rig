import type { Knex } from "knex"
import type { HalfAxisId } from "$lib/shared/constants"
import { oddHalfAxisIds } from "$lib/shared/constants"
import { Model, RelationMappings, RelationMappingsThunk } from "objection"
import { v4 as uuidv4 } from "uuid"


export type GraphConstruct = Direction | Space | Thing


/*
 * Direction model.
 */
export class Direction extends Model {
    static tableName = "directions" as const

    id!: number
    oppositeid!: number | null
    text!: string | null
    nameforobjects!: string | null
    spaces!: Space[]
}


/*
 * Space model.
 */
export class Space extends Model {
    static tableName = "spaces" as const

    id!: number
    text!: string | null
    directions!: Direction[]


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


/*
 * Relationship model.
 */
class Relationship extends Model {
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

/*
 * Thing model.
 */
export class Thing extends Model {
    static tableName = "things" as const

    id!: number
    guid!: string
    text!: string
    whencreated!: Date | null
    whenmodded!: Date | null
    whentrashed!: Date | null
    whenvisited!: Date | null
    defaultplane!: number | null//CAN WE RENAME TO DEFAULTSPACEID?
    depthprofile!: string// Default is "{}"
    formula!: string// Default is "{}"
    lastformulated!: Date | null
    fillcolor!: string | null
    stackbehavior!: string | null
    xoffset!: number | null
    yoffset!: number | null
    zoffset!: number | null
    perspectivedepths!: string// Default is "{}"
    taskactivity!: number | null
    taskactivityreps!: number// Default is 1
    access!: number | null
    perspectivetexts!: string// Default is "{}"
    ensystems!: number | null
    portalperspectivethingid!: number | null
    portaldefaultspaceid!: number | null
    sizemultiplier!: number// Default is 1.0
    perspectiveviewers!: string// Default is "{}"

    note!: Note | null
    a_relationships!: Relationship[]
    b_relationships!: Relationship[]


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

    get relationshipInfos(): { relatedThingId: number | null, directionId: number, order: number | null }[] {
        let relationshipInfos: { relatedThingId: number | null, directionId: number, order: number | null }[] = []
        for (const relationship of this.b_relationships) relationshipInfos.push(
            { relatedThingId: relationship.thingbid, directionId: relationship.direction, order: relationship.relationshiporder }
        )
        relationshipInfos = Array.from(new Set(relationshipInfos))
        relationshipInfos.sort((a, b) => (a.order ? a.order : 0) - (b.order ? b.order : 0))
        return relationshipInfos
    }

    get relatedThingIds(): (number | null)[] {
        const relatedThingIds: (number | null)[] = []
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
            if (!(relatedThingId === null || relatedThingId in relatedThingIdsByDirectionId[directionId])) relatedThingIdsByDirectionId[directionId].push(relatedThingId)
        }
        return relatedThingIdsByDirectionId
    }
}


/*
 * Note model.
 */
export class Note extends Model {
    kind = "note" as const
    static tableName = "notes" as const

    id!: number
    text!: string

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


/*
 * Functions to query Graph constructs.
 */
export async function queryDirections(directionIds: number): Promise<null | Direction>;
export async function queryDirections(directionIds: number[]): Promise<Direction[]>;
export async function queryDirections(directionIds: null, idsToExclude?: number[]): Promise<Direction[]>;
export async function queryDirections(directionIds: number | number[] | null, idsToExclude?: number[]): Promise<null | Direction | Direction[]> {
    
    // If a null ID is supplied,
    if (directionIds === null) {
        // If no IDs to exclude are supplied, query all Directions.
        if (!idsToExclude) {
            const queriedDirections = await Direction.query()
                .orderBy('id')
            return queriedDirections
        // If IDs to exclude are supplied, query all Directions not matching those IDs.
        } else {
            const queriedDirections = await Direction.query()
                .where(
                    (builder) => builder.whereNotIn('id', idsToExclude)
                )
                .orderBy('id')
            return queriedDirections
        }

    // If a single ID is supplied, query based on match to that ID (or return null if nothing is found).
    } else if (typeof directionIds === "number") {
        const queriedDirections = await Direction.query()
            .where("id", directionIds)
            .orderBy('id')
        return queriedDirections.length ? queriedDirections[0] : null

    // If multiple IDs are supplied, query based on match to those IDs.
    } else if (directionIds.length) {
        const queriedDirections = await Direction.query()
            .where(
                (builder) => builder.whereIn('id', directionIds)
            )
            .orderBy('id')
        return queriedDirections

    // If an empty array is supplied, return an empty array.
    } else {
        return []
    }
}


/*
 * Typeguard functions for Graph construct classes.
 */
export function isDirection(construct: GraphConstruct): construct is Direction {
    return "oppositeid" in construct
}

export function isSpace(construct: GraphConstruct): construct is Space {
    return "directions" in construct
}

export function isThing(construct: GraphConstruct): construct is Thing {
    return "note" in construct
}


/*
 * Functions to query Graph constructs from the database.
 */
export async function querySpaces(spaceIds: number): Promise<null | Space>;
export async function querySpaces(spaceIds: number[]): Promise<Space[]>;
export async function querySpaces(spaceIds: null, idsToExclude?: number[]): Promise<Space[]>;
export async function querySpaces(spaceIds: number | number[] | null, idsToExclude?: number[]): Promise<null | Space | Space[]> {
    
    // If a null ID is supplied,
    if (spaceIds === null) {
        // If no IDs to exclude are supplied, query all Spaces.
        if (!idsToExclude) {
            const queriedSpaces = await Space.query()
                .allowGraph('directions')
                .withGraphFetched('directions')
                .orderBy('id')
            return queriedSpaces
        // If IDs to exclude are supplied, query all Spaces not matching those IDs.
        } else {
            const queriedSpaces = await Space.query()
                .where(
                    (builder) => builder.whereNotIn('id', idsToExclude)
                )
                .allowGraph('directions')
                .withGraphFetched('directions')
                .orderBy('id')
            return queriedSpaces
        }

    // If a single ID is supplied, query based on match to that ID (or return null if nothing is found).
    } else if (typeof spaceIds === "number") {
        const queriedSpaces = await Space.query()
            .where("id", spaceIds)
            .allowGraph('directions')
            .withGraphFetched('directions')
            .orderBy('id')
        return queriedSpaces.length ? queriedSpaces[0] : null

    // If multiple IDs are supplied, query based on match to those IDs.
    } else if (spaceIds.length) {
        const queriedSpaces = await Space.query()
            .where(
                (builder) => builder.whereIn('id', spaceIds)
            )
            .allowGraph('directions')
            .withGraphFetched('directions')
            .orderBy('id')
        return queriedSpaces

    // If an empty array is supplied, return an empty array.
    } else {
        return []
    }
}

export async function queryThings(thingIds: number): Promise<null | Thing>;
export async function queryThings(thingIds: number[]): Promise<Thing[]>;
export async function queryThings(thingIds: number | number[]): Promise<null | Thing | Thing[]> {

    // If a single ID is supplied, query based on match to that ID (or return null if nothing is found).
    if (typeof thingIds === "number") {
        const queriedThings = await Thing.query()
            .where("id", thingIds)
            .allowGraph('[a_relationships, b_relationships, note]')
            .withGraphFetched('[a_relationships, b_relationships, note]')
            .orderBy('id')
        return queriedThings.length ? queriedThings[0] : null

    // If multiple IDs are supplied, query based on match to those IDs.
    } else {
        const queriedThings = await Thing.query()
            .where(
                (builder) => builder.whereIn('id', thingIds)
            )
            .allowGraph('[a_relationships, b_relationships, note]')
            .withGraphFetched('[a_relationships, b_relationships, note]')
            .orderBy('id')
        return queriedThings
    }
}






interface NewThingInfo {
    guid: string,
    text: string,
    whencreated: string,
    whenmodded: null,
    whentrashed: null,
    whenvisited: null,
    defaultplane: number,
    depthprofile: "{}",
    formula: "{}",
    lastformulated: null,
    fillcolor: null,
    stackbehavior: null,
    xoffset: null,
    yoffset: null,
    zoffset: null,
    perspectivedepths: "{}",
    taskactivity: null,
    taskactivityreps: 1,
    access: number | null
    perspectivetexts: "{}",
    ensystems: null,
    portalperspectivethingid: null,
    portaldefaultspaceid: null,
    sizemultiplier: 1,
    perspectiveviewers: "{}"
}

function getNewThingInfo(text: string, whenCreated: string, defaultSpace: number): NewThingInfo {
    const newThingInfo = {
        guid: uuidv4(),
        text: text,
        whencreated: whenCreated,
        whenmodded: null,
        whentrashed: null,
        whenvisited: null,
        defaultplane: defaultSpace,
        depthprofile: "{}" as const,
        formula: "{}" as const,
        lastformulated: null,
        fillcolor: null,
        stackbehavior: null,
        xoffset: null,
        yoffset: null,
        zoffset: null,
        perspectivedepths: "{}" as const,
        taskactivity: null,
        taskactivityreps: 1 as const,
        access: null,
        perspectivetexts: "{}" as const,
        ensystems: null,
        portalperspectivethingid: null,
        portaldefaultspaceid: null,
        sizemultiplier: 1 as const,
        perspectiveviewers: "{}" as const
    }

    return newThingInfo
}

interface NewRelationshipInfo {
    guid: string,
    thingaid: number,
    thingbid: number,
    whencreated: string,
    whenmodded: null,
    whentrashed: null,
    text: null,
    direction: number,
    meta: 0,
    relationshiporder: null,
    access: null,
    ensystemed: null
}

function getNewRelationshipInfo(thingAId: number, thingBId: number, whenCreated: string, direction: number): NewRelationshipInfo {
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

// H2 doesn't mesh with Objection's PostgreSQL syntax naturally. This function is a
// temporary fix until H2 is replaced with another database. It takes the querystring,
// modifies it appropriately for H2 syntax, then runs it.
async function alterQuerystringForH2AndRun(
    querystring: string, transaction: Knex.Transaction, whenCreated: string, constructName: "Thing" | "Relationship"
): Promise< Thing | Relationship > {
    querystring = querystring.replace(` returning "ID"`, "")

    const knex = Model.knex()
    await knex.raw(querystring).transacting(transaction)
    
    const latestConstructResults = constructName === "Thing" ?
        await Thing.query().select("id").where({whencreated: whenCreated}).transacting(transaction) :
        await Relationship.query().select("id").where({whencreated: whenCreated}).transacting(transaction)
    const latestConstruct = latestConstructResults[0]

    return latestConstruct
}


export async function createNewRelatedThing(thingIdToRelateFrom: number): Promise<void> {///////////// BACK IT UP!!!!!!
    const whenCreated = (new Date()).toISOString()

    const knex = Model.knex()
    knex.transaction(async (transaction: Knex.Transaction) => {

        const newThingInfo = getNewThingInfo("TEXT", whenCreated, 2)
        const querystring1 = Thing.query().insert(newThingInfo).toKnexQuery().toString()
        const newRelatedThing = await alterQuerystringForH2AndRun(querystring1, transaction, whenCreated, "Thing") as Thing
        
        const newARelationshipInfo = getNewRelationshipInfo(thingIdToRelateFrom, newRelatedThing.id, whenCreated, 5)
        const querystring2 = Relationship.query().insert(newARelationshipInfo).toKnexQuery().toString()
        const newBRelationshipInfo = getNewRelationshipInfo(newRelatedThing.id, thingIdToRelateFrom, whenCreated, 6)
        const querystring3 = Relationship.query().insert(newBRelationshipInfo).toKnexQuery().toString()
        const [newARelationship, newBRelationship] = await Promise.all([
            alterQuerystringForH2AndRun(querystring2, transaction, whenCreated, "Relationship"),
            alterQuerystringForH2AndRun(querystring3, transaction, whenCreated, "Relationship")
        ])

        return [newRelatedThing, newARelationship, newBRelationship] 

    })
    .then(function() {
        console.log('Transaction complete.')
    })
    .catch(function(err: Error) {
        console.error(err)
    })
}