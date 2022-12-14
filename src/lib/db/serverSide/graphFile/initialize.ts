// Import types.
import type Knex from "knex"

// Import database-framework-related classes.
import { Model } from "objection"

// Import database-related methods.
import { getDbInfo } from "./dbInfo"
import { addFieldsToTable, createTable } from "./utility"



export async function graphIsUpdated(): Promise<boolean> {

    let graphIsUpdated = true

    // Get object specifying default database setup.
    const dbInfo = getDbInfo()

    // For each table specified in the setup object, check whether the table
    // and all its fields exist.
    const knex = Model.knex()
    for (const [tableName, tableInfo] of Object.entries(dbInfo)) {
        
        // Check if the table exists and if any fields are missing.
        const tableExists = await knex.schema.hasTable(tableName.toUpperCase())// DO VWE NEED TO APPEND PUBLIC?
        const missingFieldNames: string[] = []
        if (tableExists) {
            for (const fieldName of Object.keys(tableInfo.fields)) {
                const tableHasField = await knex.schema.hasColumn(tableName.toUpperCase(), fieldName.toUpperCase())
                if (!tableHasField) missingFieldNames.push(fieldName)
            }
        }

        if (!tableExists || missingFieldNames.length) {
            console.log(tableName, missingFieldNames)
            graphIsUpdated = false
        }

    }

    return graphIsUpdated

}




/**
 * Initialize-or-update-Graph function.
 * 
 * Takes an existing Graph database file (or a blank template) and adds tables
 * and records to match a database info object.
 */
export async function initializeOrUpdateGraph(): Promise<void> {

    // Within a Knex database transaction,
    const knex = Model.knex()
    await knex.transaction(async (transaction: Knex.Transaction) => {

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

            console.log("NOT CHANGING STUFF")
            const go = false
            if (go) {
                // If the table doesn't exist, create it.
                if (!tableExists) {
                    await createTable(tableName, tableInfo, knex, transaction)            

                // Else, if the table is missing fields, add those fields.
                } else if (missingFieldNames.length) {
                    await addFieldsToTable(tableName, tableInfo, missingFieldNames, knex, transaction)
                }
            }

        }
        return null
    })
    
}