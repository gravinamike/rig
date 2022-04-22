// Type imports.
import type { Knex } from "knex"

// Database-related imports.
import { Model } from "objection"
import { v4 as uuidv4 } from "uuid"
import { alterQuerystringForH2AndRun } from "./utility"

// Graph-construct-related imports.
import {
    Direction, Thing, getNewThingInfo,
    Relationship, getNewRelationshipInfo,
    Note, getNewNoteInfo, NoteToThing,
    Folder, getNewFolderInfo, FolderToThing
} from "$lib/models/dbModels"

// Filesystem-related imports.
import { createFolder } from "$lib/shared/fileSystem"


/*
 * From a starting Thing, create a related Thing.
 */
export async function createNewRelatedThing(thingIdToRelateFrom: number, directionId: number, text: string): Promise<void> {
    // Get parameters for SQL query.
    const whenCreated = (new Date()).toISOString()

    // Construct and run SQL query.
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

    // Report on the response.
    .then(function() {
        console.log('Transaction complete.')
    })
    .catch(function(err: Error) {
        console.error(err)
    })
}

/*
 * Add a Note to a Thing.
 */
export async function addNoteToThing(thingId: number): Promise<void> {
    // Get parameters for SQL query.
    const whenCreated = (new Date()).toISOString()

    // Construct and run SQL query.
    const knex = Model.knex()
    await knex.transaction(async (transaction: Knex.Transaction) => {
        // Create the Note.
        const newNoteInfo = getNewNoteInfo(whenCreated)
        const querystring1 = Note.query().insert(newNoteInfo).toKnexQuery().toString()
        const newAddedNote = await alterQuerystringForH2AndRun(querystring1, transaction, whenCreated, "Note") as Note

        // Create the linker between the Note and its Thing.
        const thingToAddNoteTo = await Thing.query().findById(thingId)
        const querystring2 = thingToAddNoteTo.$relatedQuery('note').relate(newAddedNote.id).toKnexQuery().toString()
        await alterQuerystringForH2AndRun(querystring2, transaction, whenCreated, "NoteToThing") as NoteToThing

        return
    })

    // Report on the response.
    .then(function() {
        console.log('Transaction complete.')
    })
    .catch(function(err: Error) {
        console.error(err)
    })
}

/*
 * Add a Folder to a Thing.
 */
export async function addFolderToThing(thingId: number): Promise<void> {
    // Get parameters for SQL query.
    const whenCreated = (new Date()).toISOString()
    const folderGuid = uuidv4()

    // Construct and run SQL query.
    const knex = Model.knex()
    await knex.transaction(async (transaction: Knex.Transaction) => {
        // Create the Folder.
        const newFolderInfo = getNewFolderInfo(whenCreated, folderGuid)
        const querystring1 = Folder.query().insert(newFolderInfo).toKnexQuery().toString()
        const newAddedFolder = await alterQuerystringForH2AndRun(querystring1, transaction, whenCreated, "Folder") as Folder

        // Create the linker between the Folder and its Thing.
        const thingToAddFolderTo = await Thing.query().findById(thingId)
        const querystring2 = thingToAddFolderTo.$relatedQuery('folder').relate(newAddedFolder.id).toKnexQuery().toString()
        await alterQuerystringForH2AndRun(querystring2, transaction, whenCreated, "FolderToThing") as FolderToThing
        
        return
    })

    // Report on the response and create a folder in the filesystem.
    .then(function() {
        console.log('Transaction complete.')

        try {
            createFolder(folderGuid)
        } catch(err) {
            console.error(err)
        }
    })
    .catch(function(err: Error) {
        console.error(err)
    })
}

/*
 * Delete a Thing.
 */
export async function deleteThing(thingId: number): Promise<void> {
    const knex = Model.knex()
    await knex.transaction(async (transaction: Knex.Transaction) => {
        // Get associated Notes (before linkers are gone).
        const notesToDelete = await Thing.relatedQuery('note').for([thingId])
        const noteIdsToDelete = notesToDelete.map(note => note.id)
        // Delete associated Note linkers.
        await Thing.relatedQuery('noteToThing').for([thingId]).delete().transacting(transaction)
        // Delete associated Notes.
        await Note.query().delete().whereIn("id", noteIdsToDelete).transacting(transaction)

        // Get associated Folders (before linkers are gone).
        const foldersToDelete = await Thing.relatedQuery('note').for([thingId])
        const folderIdsToDelete = foldersToDelete.map(note => note.id)
        // Delete associated Folder linkers.
        await Thing.relatedQuery('folderToThing').for([thingId]).delete().transacting(transaction)
        // Delete associated Folders.
        await Folder.query().delete().whereIn("id", folderIdsToDelete).transacting(transaction)

        // Delete associated Relationships.
        await Thing.relatedQuery('a_relationships').for([thingId]).delete().transacting(transaction)
        await Thing.relatedQuery('b_relationships').for([thingId]).delete().transacting(transaction)

        // Delete the Thing itself.
        await Thing.query().delete().where("id", thingId).transacting(transaction)

        return
    })

    // Report on the response.
    .then(function() {
        console.log('Transaction complete.')
    })
    .catch(function(err: Error) {
        console.error(err)
    })
}



/*
 * Create a new Relationship
 */
export async function createNewRelationship(sourceThingId: number, destThingId: number, directionId: number): Promise<void> {

    //console.log(sourceThingId, destThingId, directionId)
    
    // Verify the Relationship does not yet exist.
    const queriedARelationships = await Relationship.query()
        .where("thingaid", destThingId)
        .where("thingbid", sourceThingId)
        .where("direction", directionId)
    const queriedBRelationships = await Relationship.query()
        .where("thingaid", sourceThingId)
        .where("thingbid", destThingId)
        .where("direction", directionId)
    const relationshipAlreadyExists = queriedARelationships.length > 0 || queriedBRelationships.length > 0

    if (relationshipAlreadyExists) {

        console.log('To-be-created Relationship would duplicate an existing Relationship. Aborting operation.')

    } else {

        // Get parameters for SQL query.
        const whenCreated = (new Date()).toISOString()
        
        // Construct and run SQL query.
        const knex = Model.knex()
        await knex.transaction(async (transaction: Knex.Transaction) => {

            // Delete any existing Relationships between source and dest Things in *other* Directions.
            await Relationship.query().delete().where("thingaid", destThingId).where("thingbid", sourceThingId).transacting(transaction)
            await Relationship.query().delete().where("thingaid", sourceThingId).where("thingbid", destThingId).transacting(transaction)

            // Get Direction info.
            const direction = (await Direction.query().where("id", directionId))[0]
            const oppositeDirectionId = direction.oppositeid as number

            // Create new Relationship.
            const newARelationshipInfo = getNewRelationshipInfo(sourceThingId, destThingId, whenCreated, directionId)
            const querystring1 = Relationship.query().insert(newARelationshipInfo).toKnexQuery().toString()
            const newBRelationshipInfo = getNewRelationshipInfo(destThingId, sourceThingId, whenCreated, oppositeDirectionId)
            const querystring2 = Relationship.query().insert(newBRelationshipInfo).toKnexQuery().toString()
            const [newARelationship, newBRelationship] = await Promise.all([
                alterQuerystringForH2AndRun(querystring1, transaction, whenCreated, "Relationship"),
                alterQuerystringForH2AndRun(querystring2, transaction, whenCreated, "Relationship")
            ])

            return [newARelationship, newBRelationship]
        })

        // Report on the response.
        .then(function() {
            console.log('Transaction complete.')
        })
        .catch(function(err: Error) {
            console.error(err)
        })

    }
}