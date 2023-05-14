// Import database-framework-related classes.
import type { Knex } from "knex"
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
        const tableExists = await knex.schema.hasTable(tableName.toUpperCase())
        const missingFieldNames: string[] = []
        if (tableExists) {
            for (const fieldName of Object.keys(tableInfo.fields)) {
                const tableHasField = await knex.schema.hasColumn(tableName.toUpperCase(), fieldName.toUpperCase())
                if (!tableHasField) missingFieldNames.push(fieldName)
            }
        }

        if (!tableExists || missingFieldNames.length) {
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
            const tableExists = await knex.schema.hasTable(tableName.toUpperCase())
            const missingFieldNames: string[] = []
            if (tableExists) {
                for (const fieldName of Object.keys(tableInfo.fields)) {
                    const tableHasField = await knex.schema.hasColumn(tableName.toUpperCase(), fieldName.toUpperCase())
                    if (!tableHasField) missingFieldNames.push(fieldName)
                }
            }

            // If the table doesn't exist, create it.
            if (!tableExists) {
                await createTable(tableName, tableInfo, knex, transaction)            

            // Else, if the table is missing fields, add those fields.
            } else if (missingFieldNames.length) {
                await addFieldsToTable(tableName, tableInfo, missingFieldNames, knex, transaction)
            }

        }
        return null
    })
    
}