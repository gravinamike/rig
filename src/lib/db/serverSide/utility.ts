import type Knex from "knex"
import { Model } from "objection"
import { RawThingDbModel, RawRelationshipDbModel, RawNoteDbModel, RawNoteToThingDbModel, RawFolderDbModel, RawFolderToThingDbModel } from "$lib/models/dbModels/serverSide"


// H2 doesn't mesh with Objection's PostgreSQL syntax naturally. This function is a
// temporary fix until H2 is replaced with another database. It takes the querystring,
// modifies it appropriately for H2 syntax, then runs it.
export async function alterQuerystringForH2AndRun(
    querystring: string,
    transaction: Knex.Transaction,
    whenCreated: string,
    constructName: "Direction" | "Space" | "DirectionToSpace" | "Thing" | "Relationship" | "Note" | "NoteToThing" | "Folder" | "FolderToThing"
): Promise< RawThingDbModel | RawRelationshipDbModel | RawNoteDbModel | RawNoteToThingDbModel | RawFolderDbModel | RawFolderToThingDbModel | null > {
    // Remove the "returning" clause in the query string.
    querystring = querystring.replace(/ returning "\w+"/, "")

    // Run the modified query string.
    const knex = Model.knex()
    await knex.raw(querystring).transacting(transaction)
    
    // Return the last-created construct of the specified type (which should
    // be the construct created by this transaction).
    if (constructName === "Thing") {
        const latestConstructResults = await RawThingDbModel.query().select("id").where({whencreated: whenCreated})
            .allowGraph('[a_relationships, b_relationships, note, folder]')
            .withGraphFetched('[a_relationships, b_relationships, note, folder]')
            .transacting(transaction)
        return latestConstructResults[0]
    } else if (constructName === "Relationship") {
        const latestConstructResults = await RawRelationshipDbModel.query().select("id").where({whencreated: whenCreated}).transacting(transaction)
        return latestConstructResults[0]
    } else if (constructName === "Note") {
        const latestConstructResults = await RawNoteDbModel.query().select("id").where({whencreated: whenCreated}).transacting(transaction)
        return latestConstructResults[0]
    } else if (constructName === "NoteToThing") {
        const latestConstructResults = await RawNoteToThingDbModel.query().select("id").transacting(transaction)
        return latestConstructResults[0]
    } else if (constructName === "Folder") {
        const latestConstructResults = await RawFolderDbModel.query().select("id").where({whencreated: whenCreated}).transacting(transaction)
        return latestConstructResults[0]
    } else if (constructName === "FolderToThing") {
        const latestConstructResults = await RawFolderToThingDbModel.query().select("id").transacting(transaction)
        return latestConstructResults[0]
    } else {
        return null
    }
}