// Type imports.
import type Knex from "knex"

// Database-related imports.
import { Model } from "objection"
import { v4 as uuidv4 } from "uuid"
import { alterQuerystringForH2AndRun } from "./utility"

// Graph-construct-related imports.
import {
    DirectionDbModel, ThingDbModel, getNewThingInfo,
    RelationshipDbModel, getNewRelationshipInfo,
    NoteDbModel, getNewNoteInfo, NoteToThingDbModel,
    FolderDbModel, getNewFolderInfo, FolderToThingDbModel
} from "$lib/models/dbModels"
import { Thing } from "$lib/models/graphModels"

// Filesystem-related imports.
import { createFolder } from "$lib/shared/fileSystem"

import { changeIndexInArray } from "$lib/shared/utility"


/*
 * From a starting Thing, create a related Thing.
 */
export async function createNewRelatedThing(thingIdToRelateFrom: number, directionId: number, text: string): Promise<Thing | false> {
    try {    
        // Get parameters for SQL query.
        const whenCreated = (new Date()).toISOString()

        // Construct and run SQL query.
        const knex = Model.knex()
        const newRelatedThing = await knex.transaction(async (transaction: Knex.Transaction) => {
            // Create new Thing.
            const newThingInfo = getNewThingInfo(text, whenCreated, 2)
            const querystring1 = ThingDbModel.query().insert(newThingInfo).toKnexQuery().toString()
            const newRelatedThingDbModel = await alterQuerystringForH2AndRun(querystring1, transaction, whenCreated, "Thing") as ThingDbModel
            
            // Get Direction info.
            const direction = (await DirectionDbModel.query().where("id", directionId))[0]
            const oppositeDirectionId = direction.oppositeid as number

            // Create new Relationship.
            const newARelationshipInfo = getNewRelationshipInfo(thingIdToRelateFrom, Number(newRelatedThingDbModel.id), whenCreated, directionId)
            const querystring2 = RelationshipDbModel.query().insert(newARelationshipInfo).toKnexQuery().toString()
            const newBRelationshipInfo = getNewRelationshipInfo(Number(newRelatedThingDbModel.id), thingIdToRelateFrom, whenCreated, oppositeDirectionId)
            const querystring3 = RelationshipDbModel.query().insert(newBRelationshipInfo).toKnexQuery().toString()
            await Promise.all([
                alterQuerystringForH2AndRun(querystring2, transaction, whenCreated, "Relationship"),
                alterQuerystringForH2AndRun(querystring3, transaction, whenCreated, "Relationship")
            ])

            const newRelatedThing = new Thing(newRelatedThingDbModel)

            return newRelatedThing
        })

        return newRelatedThing as Thing

    } catch(err) {
        console.error(err)
        return false
    }
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
        const querystring1 = NoteDbModel.query().insert(newNoteInfo).toKnexQuery().toString()
        const newAddedNote = await alterQuerystringForH2AndRun(querystring1, transaction, whenCreated, "Note") as NoteDbModel

        // Create the linker between the Note and its Thing.
        const thingToAddNoteTo = await ThingDbModel.query().findById(thingId)
        const querystring2 = thingToAddNoteTo.$relatedQuery('note').relate(newAddedNote.id).toKnexQuery().toString()
        await alterQuerystringForH2AndRun(querystring2, transaction, whenCreated, "NoteToThing") as NoteToThingDbModel

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
 * Update the text of a Note.
 */
export async function updateNote(noteId: number, text: string): Promise<void> {
    // Get parameters for SQL query.
    const whenModded = (new Date()).toISOString()

    // Construct and run SQL query.
    const knex = Model.knex()
    await knex.transaction(async (transaction: Knex.Transaction) => {
        // Update the Note.
        await NoteDbModel.query().patch({ text: text, whenmodded: whenModded }).where('id', noteId).transacting(transaction)
        
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
        const querystring1 = FolderDbModel.query().insert(newFolderInfo).toKnexQuery().toString()
        const newAddedFolder = await alterQuerystringForH2AndRun(querystring1, transaction, whenCreated, "Folder") as FolderDbModel

        // Create the linker between the Folder and its Thing.
        const thingToAddFolderTo = await ThingDbModel.query().findById(thingId)
        const querystring2 = thingToAddFolderTo.$relatedQuery('folder').relate(newAddedFolder.id).toKnexQuery().toString()
        await alterQuerystringForH2AndRun(querystring2, transaction, whenCreated, "FolderToThing") as FolderToThingDbModel
        
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
        const notesToDelete = await ThingDbModel.relatedQuery('note').for([thingId])
        const noteIdsToDelete = notesToDelete.map(note => note.id)
        // Delete associated Note linkers.
        await ThingDbModel.relatedQuery('noteToThing').for([thingId]).delete().transacting(transaction)
        // Delete associated Notes.
        await NoteDbModel.query().delete().whereIn("id", noteIdsToDelete).transacting(transaction)

        // Get associated Folders (before linkers are gone).
        const foldersToDelete = await ThingDbModel.relatedQuery('note').for([thingId])
        const folderIdsToDelete = foldersToDelete.map(note => note.id)
        // Delete associated Folder linkers.
        await ThingDbModel.relatedQuery('folderToThing').for([thingId]).delete().transacting(transaction)
        // Delete associated Folders.
        await FolderDbModel.query().delete().whereIn("id", folderIdsToDelete).transacting(transaction)

        // Delete associated Relationships.
        await ThingDbModel.relatedQuery('a_relationships').for([thingId]).delete().transacting(transaction)
        await ThingDbModel.relatedQuery('b_relationships').for([thingId]).delete().transacting(transaction)

        // Delete the Thing itself.
        await ThingDbModel.query().delete().where("id", thingId).transacting(transaction)

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
    const queriedARelationships = await RelationshipDbModel.query()
        .where("thingaid", destThingId)
        .where("thingbid", sourceThingId)
        .where("direction", directionId)
    const queriedBRelationships = await RelationshipDbModel.query()
        .where("thingaid", sourceThingId)
        .where("thingbid", destThingId)
        .where("direction", directionId)
    const relationshipAlreadyExists = queriedARelationships.length > 0 || queriedBRelationships.length > 0

    if (relationshipAlreadyExists) {

        console.log("To-be-created Relationship would duplicate an existing Relationship. Aborting operation.")
    
    } else if (sourceThingId === destThingId) {

        console.log("To-be-created Relationship would relate a Thing to itself. Aborting operation.")

    } else {

        // Get parameters for SQL query.
        const whenCreated = (new Date()).toISOString()
        
        // Construct and run SQL query.
        const knex = Model.knex()
        await knex.transaction(async (transaction: Knex.Transaction) => {

            // Delete any existing Relationships between source and dest Things in *other* Directions.
            await RelationshipDbModel.query().delete().where("thingaid", destThingId).where("thingbid", sourceThingId).transacting(transaction)
            await RelationshipDbModel.query().delete().where("thingaid", sourceThingId).where("thingbid", destThingId).transacting(transaction)

            // Get Direction info.
            const direction = (await DirectionDbModel.query().where("id", directionId))[0]
            const oppositeDirectionId = direction.oppositeid as number

            // Create new Relationship.
            const newARelationshipInfo = getNewRelationshipInfo(sourceThingId, destThingId, whenCreated, directionId)
            const querystring1 = RelationshipDbModel.query().insert(newARelationshipInfo).toKnexQuery().toString()
            const newBRelationshipInfo = getNewRelationshipInfo(destThingId, sourceThingId, whenCreated, oppositeDirectionId)
            const querystring2 = RelationshipDbModel.query().insert(newBRelationshipInfo).toKnexQuery().toString()
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


/*
 * Update the Directions of a set of Relationships.
 */
export async function updateRelationships(relationshipInfos: {sourceThingId: number, destThingId: number, directionId: number}[]): Promise<void> {
    // Get parameters for SQL query.
    const whenModded = (new Date()).toISOString()

    let relationshipsOk = true
    for (const info of relationshipInfos) {
        // Get Direction info.
        const direction = (await DirectionDbModel.query().where("id", info.directionId))[0]
        const oppositeDirectionId = direction.oppositeid as number

        // Verify the change won't duplicate an existing Relationship.
        const forwardDuplicates = await RelationshipDbModel.query()
            .where('thingaid', info.sourceThingId)
            .where('thingbid', info.destThingId)
            .whereIn("direction", [info.directionId, oppositeDirectionId])
        const reverseDuplicates = await RelationshipDbModel.query()
            .where('thingaid', info.sourceThingId)
            .where('thingbid', info.destThingId)
            .whereIn("direction", [info.directionId, oppositeDirectionId])

        if (forwardDuplicates.length || reverseDuplicates.length) relationshipsOk = false
    }

    if (relationshipsOk) {
        
        const knex = Model.knex()
        await knex.transaction(async (transaction: Knex.Transaction) => {

            for (const info of relationshipInfos) {

                const direction = (await DirectionDbModel.query().where("id", info.directionId))[0]
                const oppositeDirectionId = direction.oppositeid as number

                await RelationshipDbModel.query()
                    .patch({ direction: info.directionId, whenmodded: whenModded })
                    .where('thingaid', info.sourceThingId)
                    .where('thingbid', info.destThingId)
                    .transacting(transaction)

                await RelationshipDbModel.query()
                    .patch({ direction: oppositeDirectionId, whenmodded: whenModded })
                    .where('thingaid', info.destThingId)
                    .where('thingbid', info.sourceThingId)
                    .transacting(transaction)
            }

            return
        })

        // Report on the response.
        .then(function() {
            console.log('Transaction complete.')
        })
        .catch(function(err: Error) {
            console.error(err)
        })

    } else {

        console.log("The specified change to this Relationship's Direction would duplicate an existing Relationship.")

    }    
}


/*
 * Update the Orders of a set of Relationships.
 */
export async function updateRelationshipOrders(relationshipInfos: {sourceThingId: number, destThingId: number, directionId: number, newOrder: number}[]): Promise<void> {
    // Get parameters for SQL query.
    const whenModded = (new Date()).toISOString()
    
    const knex = Model.knex()
    await knex.transaction(async (transaction: Knex.Transaction) => {
        for (const info of relationshipInfos) {
            await RelationshipDbModel.query()
                .patch({ relationshiporder: info.newOrder, whenmodded: whenModded })
                .where('thingaid', info.sourceThingId)
                .where('thingbid', info.destThingId)
                .where('direction', info.directionId)
                .transacting(transaction)

            await RelationshipDbModel.query()
                .patch({ relationshiporder: info.newOrder, whenmodded: whenModded })
                .where('thingaid', info.destThingId)
                .where('thingbid', info.sourceThingId)
                .where('direction', info.directionId)
                .transacting(transaction)
        }
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
 * Delete a Relationship.
 */
export async function deleteRelationship(sourceThingId: number, destThingId: number): Promise<void> {
    const knex = Model.knex()
    await knex.transaction(async (transaction: Knex.Transaction) => {

        // Delete Relationship (both forward and reverse).
        await RelationshipDbModel.query().delete().where("thingaid", sourceThingId).where("thingbid", destThingId).transacting(transaction)
        await RelationshipDbModel.query().delete().where("thingbid", sourceThingId).where("thingaid", destThingId).transacting(transaction)

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
 * Mark Things as visited.
 */
export async function markThingsVisited(thingIds: number[]): Promise<void> {
    const knex = Model.knex()
    await knex.transaction(async (transaction: Knex.Transaction) => {
        const timestamp = (new Date()).toISOString()
        await ThingDbModel.query().whereIn("id", thingIds).patch({whenvisited: timestamp}).transacting(transaction)

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
 * Mark Notes as modified.
 */
export async function markNotesModified(noteIds: number[]): Promise<void> {
    const knex = Model.knex()
    await knex.transaction(async (transaction: Knex.Transaction) => {
        const timestamp = (new Date()).toISOString()
        await NoteDbModel.query().whereIn("id", noteIds).patch({whenmodded: timestamp}).transacting(transaction)

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



interface UpdateRelationshipOrderInfo {
    sourceThingId: number,
    destThingId: number,
    directionId: number,
    newOrder: number
}

export async function reorderRelationship(
    sourceThingId: number,
    destThingDirectionId: number,
    destThingId: number,
    newIndex: number
): Promise<void> {

    console.log(sourceThingId, destThingDirectionId, destThingId, newIndex)

    // Get info on the Relationships in the Cohort.
    const queriedARelationships = await RelationshipDbModel.query()
        .where("thingbid", sourceThingId)
        .where("direction", destThingDirectionId)
    const queriedBRelationships = await RelationshipDbModel.query()
        .where("thingaid", sourceThingId)
        .where("direction", destThingDirectionId)

    const relationshipOrderingInfos: { destThingId: number, order: number | null }[] = []
    queriedARelationships.forEach( model => {
        relationshipOrderingInfos.push(
            {
                destThingId: model.thingaid as number,
                order: model.relationshiporder,
            }
        )
    } )
    queriedBRelationships.forEach( model => {
        relationshipOrderingInfos.push(
            {
                destThingId: model.thingbid as number,
                order: model.relationshiporder,
            }
        )
    } )

    // Order the Relationship infos according to their order attributes.
    const orderedRelationshipOrderingInfos = relationshipOrderingInfos
        .sort((a, b) => (a.order ? a.order : 0) - (b.order ? b.order : 0))


    // Move the to-be-reordered Relationship to the specified new index.
    const currentIndex = orderedRelationshipOrderingInfos.findIndex(info => info.destThingId === destThingId)
    const reOrderedRelationshipOrderingInfos = (
        changeIndexInArray(orderedRelationshipOrderingInfos, currentIndex, newIndex) as
            {destThingId: number, order: number | null}[]
    )

    
    const updateRelationshipOrderInfos: UpdateRelationshipOrderInfo[] = []
    reOrderedRelationshipOrderingInfos.forEach( (info, i) => {
        updateRelationshipOrderInfos.push(
            {
                sourceThingId: sourceThingId,
                destThingId: info.destThingId,
                directionId: destThingDirectionId,
                newOrder: i
            }
        )
    } )

    updateRelationshipOrders(updateRelationshipOrderInfos)////// BACK UP GRAPH, THEN TEST.
}