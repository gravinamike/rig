// Import types.
import type Knex from "knex"

// Import database-framework-related classes.
import { Model } from "objection"

// Import database-related methods.
import { getDbInfo } from "./dbInfo"
import { addFieldsToTable, createTable } from "./utility"


/**
 * Initialize-or-update-Graph function.
 * 
 * Takes an existing Graph database file (or a blank template) and adds tables
 * and records to match a database info object.
 */
export async function initializeOrUpdateGraph(confirmUpdate=false): Promise<void> {

    // Within a Knex database transaction,
    const knex = Model.knex()
    await knex.transaction(async (transaction: Knex.Transaction) => {

        // Initialize user-has-confirmed-update flag.
        let userHasConfirmedUpdate = false

        // Get object specifying default database setup.
        const dbInfo = getDbInfo()

        // For each table specified in the setup object, create the table and
        // populate it with default starting records.
        for (const [tableName, tableInfo] of Object.entries(dbInfo)) {

            // Check if the table exists and if any fields are missing.
            const tableExists = await knex.schema.hasTable(tableName)
            const missingFieldNames: string[] = []
            if (tableExists) {
                for (const fieldName of Object.keys(tableInfo.fields)) {
                    const tableHasField = await knex.schema.hasColumn(tableName, fieldName)
                    if (tableHasField) missingFieldNames.push(fieldName)
                }
            }

            // Give user the option to abort before updating the Graph.
            if (confirmUpdate && !userHasConfirmedUpdate && (!tableExists || missingFieldNames.length)) {
                if (confirm(`This Graph is missing database tables or fields. The app will now attempt to update the Graph. It's a good idea to have a backup copy of the Graph in case something goes wrong. Do you want to continue?`)) {
                    userHasConfirmedUpdate = true
                } else {
                    return
                }
            }

            // If the table doesn't exist, create it.
            if (!tableExists) {
                await createTable(tableName, tableInfo, knex, transaction)            

            // Else, if the table is missing fields, add those fields.
            } else if (missingFieldNames.length) {
                await addFieldsToTable(tableName, tableInfo, missingFieldNames, knex, transaction)
            }
            console.log("END INITIALIZE")
        }
        return null
    })
    
}