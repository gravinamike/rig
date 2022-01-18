import type { Knex } from "knex"

import { Model } from "objection"
import { Direction, Thing, getNewThingInfo, Relationship, getNewRelationshipInfo } from "$lib/models/dbModels"
import { alterQuerystringForH2AndRun } from "./utility"


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


export async function deleteThing(thingId: number): Promise<void> {
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