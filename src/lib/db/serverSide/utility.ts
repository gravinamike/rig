import type { Knex } from "knex"
import { Model } from "objection"
import { ThingDbModel, RelationshipDbModel, NoteDbModel, NoteToThingDbModel, FolderDbModel, FolderToThingDbModel } from "$lib/models/dbModels"


// H2 doesn't mesh with Objection's PostgreSQL syntax naturally. This function is a
// temporary fix until H2 is replaced with another database. It takes the querystring,
// modifies it appropriately for H2 syntax, then runs it.
export async function alterQuerystringForH2AndRun(
    querystring: string,
    transaction: Knex.Transaction,
    whenCreated: string,
    constructName: "Thing" | "Relationship" | "Note" | "NoteToThing" | "Folder" | "FolderToThing"
): Promise< ThingDbModel | RelationshipDbModel | NoteDbModel | NoteToThingDbModel | FolderDbModel | FolderToThingDbModel > {
    // Remove the "returning" clause in the query string.
    querystring = querystring.replace(/ returning "\w+"/, "")

    // Run the modified query string.
    const knex = Model.knex()
    await knex.raw(querystring).transacting(transaction)
    
    // Return the last-created construct of the specified type (which should
    // be the construct created by this transaction).
    let latestConstructResults: ThingDbModel[] | RelationshipDbModel[] | NoteDbModel[] | NoteToThingDbModel[] | FolderDbModel[] | FolderToThingDbModel[]
    switch (constructName) {
        case "Thing":
            latestConstructResults = await ThingDbModel.query().select("id").where({whencreated: whenCreated}).transacting(transaction)
            break
        case "Relationship":
            latestConstructResults = await RelationshipDbModel.query().select("id").where({whencreated: whenCreated}).transacting(transaction)
            break
        case "Note":
            latestConstructResults = await NoteDbModel.query().select("id").where({whencreated: whenCreated}).transacting(transaction)
            break
        case "NoteToThing":
            latestConstructResults = await NoteToThingDbModel.query().select("id").transacting(transaction)
            break
        case "Folder":
            latestConstructResults = await FolderDbModel.query().select("id").where({whencreated: whenCreated}).transacting(transaction)
            break
        case "FolderToThing":
            latestConstructResults = await FolderToThingDbModel.query().select("id").transacting(transaction)
            break
    }
    return latestConstructResults[0]
}