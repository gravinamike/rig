// Import types.
import type Knex from "knex"
import type { TableInfo } from "./dbInfo"


/**
 * Create-table method.
 * 
 * Creates a new table in the Graph's database.
 * @param tableName - The name of the table to be created.
 * @param tableInfo - Information about the table to be created.
 * @param knex - The Knex instance that is connected to the database.
 * @param transaction - The database transaction that will contain this operation.
 */
export async function createTable(
    tableName: string,
    tableInfo: TableInfo,
    knex: Knex,
    transaction: Knex.Transaction
): Promise<void> {

    const fieldStrings: string[] = []
    for (const [fieldName, dataType] of Object.entries(tableInfo.fields)) {

        // Start the substring with field name and datatype text.
        let queryLine = `${fieldName} ${dataType}`

        // Add constraint text if needed.
        const constraintText =
            fieldName in tableInfo.constraints ? tableInfo.constraints[fieldName] :
            null
        if (constraintText) queryLine = `${queryLine} ${constraintText}`

        // Add default-value text if needed.
        const defaultValueText =
            fieldName in tableInfo.defaultValues ? convertValueForQuery(tableInfo.defaultValues[fieldName]) :
            null
        if (defaultValueText) queryLine = `${queryLine} DEFAULT ${defaultValueText}`

        // Add final semicolon.
        queryLine = `${queryLine};`

        // Add the substring to the array.
        fieldStrings.push(queryLine)
    }

    // Construct and run the full querystring to create the table.
    const querystring1 = `CREATE TABLE IF NOT EXISTS ${ tableName } (${ fieldStrings.join(", ") });`
    await knex.raw(querystring1).transacting(transaction)

    // Construct queries to create the default records in each table.
    const tableRecordQuerystrings: string[] = []
    for (const entryValues of tableInfo.entries) {
        const processedValues = entryValues.map(convertValueForQuery)
        const queryLine = `INSERT INTO ${ tableName }(${ Object.keys(tableInfo.fields).join(", ") }) VALUES (${ processedValues.join(", ") });`
        tableRecordQuerystrings.push(queryLine)
    }
    // Run queries to create the default records in each table.
    for (const queryLine of tableRecordQuerystrings) {
        await knex.raw(queryLine).transacting(transaction)
    }

}







/**
 * Add-fields-to-table method.
 * 
 * Adds a set of new fields to an existing table in the Graph's database.
 * @param tableName - The name of the table to be modified with new fields.
 * @param tableInfo - Info about the table to be modified with new fields.
 * @param fieldNames - The names of the fields to be created.
 * @param knex - The Knex instance that is connected to the database.
 * @param transaction - The database transaction that will contain this operation.
 */
export async function addFieldsToTable(
    tableName: string,
    tableInfo: TableInfo,
    fieldNames: string[],
    knex: Knex,
    transaction: Knex.Transaction
): Promise<void> {
    
    // Construct queries to create the fields.
    const fieldQuerystrings: string[] = []
    for (const [fieldName, dataType] of Object.entries(tableInfo.fields)) {

        if (fieldNames.includes(fieldName)) {

            // Start the substring with field name and datatype text.
            let queryLine = `ALTER TABLE ${ tableName } ADD COLUMN IF NOT EXISTS ${ fieldName } ${ dataType }`
            
            // Add constraint text if needed.
            const constraintText =
                fieldName in tableInfo.constraints ? tableInfo.constraints[fieldName] :
                null
            if (constraintText) queryLine = `${queryLine} ${constraintText}`

            // Add default-value text if needed.
            const defaultValueText =
                fieldName in tableInfo.defaultValues ? convertValueForQuery(tableInfo.defaultValues[fieldName]) :
                null
            if (defaultValueText) queryLine = `${queryLine} DEFAULT ${defaultValueText}`

            // Add final semicolon.
            queryLine = `${queryLine};`

            // Add the substring to the array.
            fieldQuerystrings.push(queryLine)


            if (defaultValueText !== null) {
                const backfillDefaultsQueryLine = `UPDATE ${ tableName } SET ${ fieldName } = ${ defaultValueText };`
                fieldQuerystrings.push(backfillDefaultsQueryLine)
            }

        }

    }
    
    // Run queries to create the fields.
    for (const queryLine of fieldQuerystrings) {
        await knex.raw(queryLine).transacting(transaction)
    }

}


/**
 * Convert-value-for-query method.
 * 
 * Converts field values as defined in a DbInfo object into appropriately-
 * formatted strings or number to be put into database queries.
 * @param info - The field value as specified in the DbInfo object.
 * @returns A string or number to be put into the database query.
 */
export function convertValueForQuery(info: string | number | null): string | number {
    // Enclose strings in single-quotes.
    if (typeof info === "string") {
        return `'${info}'`

    // Convert nulls to the string "NULL".
    } else if (info === null) {
        return "NULL"

    // Return numbers as they are.
    } else {
        return info
    }
}