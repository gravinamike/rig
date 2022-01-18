import type { Knex } from "knex"

import { Model } from "objection"
import { Thing, Relationship } from "$lib/models/dbModels"


// H2 doesn't mesh with Objection's PostgreSQL syntax naturally. This function is a
// temporary fix until H2 is replaced with another database. It takes the querystring,
// modifies it appropriately for H2 syntax, then runs it.
export async function alterQuerystringForH2AndRun(
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