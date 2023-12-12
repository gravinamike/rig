import path from "path"
import Knex from "knex"
import pkg from "objection"
const { Model, knexSnakeCaseMappers } = pkg
import { dbPortStore, graphsBaseFolderStore } from "$lib/stores"
import { get } from "svelte/store"


// We use a global to keep a cached connection across hot reloads
// in dev mode, preventing costly multiplication of connections.
/* eslint-disable-next-line no-var */
declare var global: {
    h2: {
        connection: typeof Model | null,
        promise: Promise<typeof Model> | null
    }
}
if (!('h2' in global && global.h2)) global.h2 = { connection: null, promise: null }
const cached = global.h2

/**
 * Get a connection to the Graphs database.
 */
export async function getDatabaseConnection(
    graphName: string
): Promise<typeof Model> {
    const dbPort = get(dbPortStore)
    const graphsBaseFolder = get(graphsBaseFolderStore)
    const unigraphFolderName = graphName
    const unigraphFolderPath = unigraphFolderName ?
        path.join(graphsBaseFolder, unigraphFolderName) :
        null
    
    const knexConfig = {
        client: 'pg',
        version: '1.4',
        connection: {
            user: 'sa',
            host: 'localhost',
            database: `${unigraphFolderPath}/graph;MODE=PostgreSQL;`,// PostgreSQL compatibility mode, for original database file.
            //database: `${unigraphPath}/graph;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH`,// PostgreSQL compatibility mode. Use this version for subsequent new database files.
            password: 'goodguess',
            port: dbPort,
        },
        ...knexSnakeCaseMappers({ upperCase: true })
    }

    // If the database has changed, clear the cache.
    if (
        cached.connection
        && cached.connection.knex().client.config.connection.database !== knexConfig.connection.database
    ) {
        cached.connection = null
        cached.promise = null
    }
    
    // If there is no cached connection, create one and cache it.
    if (!cached.connection) {
        if (!cached.promise) {
            const modelPromise = (async function() {
                const knex = Knex(knexConfig)
                Model.knex(knex)
                return Model
            })()

            cached.promise = modelPromise
        }
        cached.connection = await cached.promise
    }

    // Return the cached connection.
    return cached.connection
}


/**
 * Get a connection to the authentication database.
 */
export async function getAuthDatabaseConnection(): Promise< void > {
    // Create a Knex instance to handle the authentication database connection.
    const knex = Knex({
        client: "sqlite3",
        useNullAsDefault: true,
        connection: {
            filename: path.resolve("static/auth/authentication.db")
        }
    })

    // Hand the Knex instance off to Objection.js.
    Model.knex(knex)
}