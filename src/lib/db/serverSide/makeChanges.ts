import type { Knex } from "knex"

import { Model } from "objection"
import { Direction, Thing, getNewThingInfo, Relationship, getNewRelationshipInfo, Note, getNewNoteInfo, NoteToThing} from "$lib/models/dbModels"
import { alterQuerystringForH2AndRun } from "./utility"


export async function createNewRelatedThing(thingIdToRelateFrom: number, directionId: number, text: string): Promise<void> {
    const whenCreated = (new Date()).toISOString()

    const knex = Model.knex()
    await knex.transaction(async (transaction: Knex.Transaction) => {
        // Create new Thing.
        const newThingInfo = getNewThingInfo(text, whenCreated, 2)
        const querystring1 = Thing.query().insert(newThingInfo).toKnexQuery().toString()
        const newRelatedThing = await alterQuerystringForH2AndRun(querystring1, transaction, whenCreated, "Thing") as Thing
        
        // Get Direction info.
        const direction = (await Direction.query().where("id", directionId))[0]
        const oppositeDirectionId = direction.oppositeid as number

        // Create new Relationship.
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


export async function addNoteToThing(thingId: number): Promise<void> {
    const whenCreated = (new Date()).toISOString()

    const knex = Model.knex()
    await knex.transaction(async (transaction: Knex.Transaction) => {

        const newNoteInfo = getNewNoteInfo(whenCreated)
        const querystring1 = Note.query().insert(newNoteInfo).toKnexQuery().toString()
        console.log(querystring1)
        const newAddedNote = await alterQuerystringForH2AndRun(querystring1, transaction, whenCreated, "Note") as Note
        const thingToAddNoteTo = await Thing.query().findById(thingId)
        const querystring2 = thingToAddNoteTo.$relatedQuery('note').relate(newAddedNote.id).toKnexQuery().toString()
        await alterQuerystringForH2AndRun(querystring2, transaction, whenCreated, "NoteToThing") as NoteToThing
        console.log(querystring2)

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


export async function deleteThing(thingId: number): Promise<void> {
    const knex = Model.knex()
    await knex.transaction(async (transaction: Knex.Transaction) => {

        // Delete associated Notes.
        await Thing.relatedQuery('note').for([thingId]).delete().transacting(transaction)
        ///////////////////////////////////////////////////////////////////////// VERIFY THAT CONNECTORS ARE ALSO DELETED

        // Delete associated Attachments.
        await Thing.relatedQuery('folder').for([thingId]).delete().transacting(transaction)
        ///////////////////////////////////////////////////////////////////////// VERIFY THAT CONNECTORS ARE ALSO DELETED

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