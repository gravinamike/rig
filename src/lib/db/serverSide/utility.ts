import type { Knex } from "knex"

import { Model } from "objection"
import { Thing, Relationship, Note, NoteToThing, Folder, FolderToThing } from "$lib/models/dbModels"


// H2 doesn't mesh with Objection's PostgreSQL syntax naturally. This function is a
// temporary fix until H2 is replaced with another database. It takes the querystring,
// modifies it appropriately for H2 syntax, then runs it.
export async function alterQuerystringForH2AndRun(
    querystring: string,
    transaction: Knex.Transaction,
    whenCreated: string,
    constructName: "Thing" | "Relationship" | "Note" | "NoteToThing" | "Folder" | "FolderToThing"
): Promise< Thing | Relationship | Note | NoteToThing | Folder | FolderToThing > {
    querystring = querystring.replace(/ returning "\w+"/, "")

    const knex = Model.knex()
    await knex.raw(querystring).transacting(transaction)
    
    let latestConstructResults: Thing[] | Relationship[] | Note[] | NoteToThing[] | Folder[] | FolderToThing[]
    switch (constructName) {
        case "Thing":
            latestConstructResults = await Thing.query().select("id").where({whencreated: whenCreated}).transacting(transaction)
            break
        case "Relationship":
            latestConstructResults = await Relationship.query().select("id").where({whencreated: whenCreated}).transacting(transaction)
            break
        case "Note":
            latestConstructResults = await Note.query().select("id").where({whencreated: whenCreated}).transacting(transaction)
            break
        case "NoteToThing":
            latestConstructResults = await NoteToThing.query().select("id").transacting(transaction)
            break
        case "Folder":
            latestConstructResults = await Folder.query().select("id").where({whencreated: whenCreated}).transacting(transaction)
            break
        case "FolderToThing":
            latestConstructResults = await FolderToThing.query().select("id").transacting(transaction)
            break
    }
    const latestConstruct = latestConstructResults[0]

    return latestConstruct
}