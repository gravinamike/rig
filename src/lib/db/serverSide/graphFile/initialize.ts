// Type imports.
import type Knex from "knex"

// Database-related imports.
import { Model } from "objection"


export async function initializeNewGraph(): Promise<void> {
    // Run the modified query string.
    const knex = Model.knex()
    const placeholder = await knex.transaction(async (transaction: Knex.Transaction) => {

        const querystring1 = `CREATE TABLE IF NOT EXISTS test ();`
        await knex.raw(querystring1).transacting(transaction)

        const querystring = `SELECT * FROM pg_catalog.pg_tables WHERE schemaname != 'pg_catalog' AND schemaname != 'information_schema';`
        const placeholder = await knex.raw(querystring).transacting(transaction)
        
        return placeholder
    })
    console.log("FOO", placeholder)
    

    //const queried = await ThingSearchListItemDbModel.query().orderBy('id')
}