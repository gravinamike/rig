import type { Knex } from "knex"

import { Model } from "objection"
import { Direction, Space, Thing, getNewThingInfo, Relationship, getNewRelationshipInfo } from "$lib/models/dbModels"

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


export async function createNewRelatedThing(thingIdToRelateFrom: number, directionId: number, text: string): Promise<void> {
    const whenCreated = (new Date()).toISOString()

    const knex = Model.knex()
    await knex.transaction(async (transaction: Knex.Transaction) => {

        const newThingInfo = getNewThingInfo(text, whenCreated, 2)
        const querystring1 = Thing.query().insert(newThingInfo).toKnexQuery().toString()
        const newRelatedThing = await alterQuerystringForH2AndRun(querystring1, transaction, whenCreated, "Thing") as Thing
        
        const direction = (await Direction.query().where("id", directionId))[0]
        const oppositeDirectionId = direction.oppositeid as number

        const newARelationshipInfo = getNewRelationshipInfo(thingIdToRelateFrom, newRelatedThing.id, whenCreated, directionId)
        const querystring2 = Relationship.query().insert(newARelationshipInfo).toKnexQuery().toString()
        const newBRelationshipInfo = getNewRelationshipInfo(newRelatedThing.id, thingIdToRelateFrom, whenCreated, oppositeDirectionId)
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

    return
}



export async function deleteThing(thingId: number): Promise<void> {/////////// BACK IT UP AND TEST IT OUT!!!!!!!!!!!!!!!
    const knex = Model.knex()
    await knex.transaction(async (transaction: Knex.Transaction) => {

        // Delete associated Relationships.
        await Thing.relatedQuery('a_relationships').for([thingId]).delete().transacting(transaction)
        await Thing.relatedQuery('b_relationships').for([thingId]).delete().transacting(transaction)

        // Delete the Thing itself.
        await Thing.query().delete().where("id", thingId).transacting(transaction)

        return
        
    })
    .then(function() {
        console.log('Transaction complete.')
    })
    .catch(function(err: Error) {
        console.error(err)
    })

    return
}