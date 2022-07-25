// Type imports.
import type Knex from "knex"

// Database-related imports.
import { Model } from "objection"

import { getDbInfo } from "./dbInfo"


function convertValueForQuery(info: string | number | null): string | number {
    if (typeof info === "string") {
        return `'${info}'`
    } else if (info === null) {
        return "NULL"
    } else {
        return info
    }
}

export async function initializeNewGraph(): Promise<void> {
    const knex = Model.knex()
    await knex.transaction(async (transaction: Knex.Transaction) => {

        const dbInfo = getDbInfo()

        for (const [tableName, tableInfo] of Object.entries(dbInfo)) {
            const queryLines1: string[] = []
            for (const [fieldName, dataType] of Object.entries(tableInfo.fields)) {
                let queryLine = `${fieldName} ${dataType}`
                const constraintText = fieldName in tableInfo.constraints ? tableInfo.constraints[fieldName] : null
                const defaultValueText = fieldName in tableInfo.defaultValues ? convertValueForQuery(tableInfo.defaultValues[fieldName]) : null

                if (constraintText) queryLine = `${queryLine} ${constraintText}`
                if (defaultValueText) queryLine = `${queryLine} DEFAULT ${defaultValueText}`
                queryLines1.push(queryLine)
            }

            // Create the tables.
            const querystring1 = `CREATE TABLE IF NOT EXISTS ${ tableName } (${ queryLines1.join(", ") });`
            //console.log(querystring1)
            await knex.raw(querystring1).transacting(transaction)


            // Create the starting entries.
            const queryLines2: string[] = []
            for (const entryValues of tableInfo.entries) {
                const processedValues = entryValues.map(convertValueForQuery)
                const queryLine = `INSERT INTO ${ tableName }(${ Object.keys(tableInfo.fields).join(", ") }) VALUES (${ processedValues.join(", ") });`
                queryLines2.push(queryLine)
            }
            for (const queryLine of queryLines2) {
                //console.log(queryLine)
                await knex.raw(queryLine).transacting(transaction)
            }


        }
        return null
    })
}