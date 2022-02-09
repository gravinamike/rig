import Knex from "knex"
import pkg from "objection"
const { Model, knexSnakeCaseMappers } = pkg
import { unigraphFolder } from "$lib/shared/constants"


const knexConfig = {
    client: 'pg',
    version: '1.4',
    connection: {
        user: 'sa',
        host: 'localhost',//'192.168.0.100',
        //database: `${unigraphFolder}/graph`,
        database: `${unigraphFolder}/graph;MODE=PostgreSQL;`,// PostgreSQL compatibility mode, for original database file.
        //database: `${unigraphPath}/graph;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH`,// PostgreSQL compatibility mode. Use this version for subsequent new database files.
        password: 'goodguess',
        port: 5435,
    },
    ...knexSnakeCaseMappers({ upperCase: true })
}

/**
 * We use a global to keep a cached connection across hot reloads
 * in dev mode, preventing costly multiplication of connections.
 */
/* eslint-disable-next-line no-var */
declare var global: {
    h2: {
        connection: typeof Model | null,
        promise: Promise<typeof Model> | null
    }
}
if (!('h2' in global && global.h2)) global.h2 = { connection: null, promise: null }
const cached = global.h2


export async function getDatabaseConnection(): Promise<typeof Model> {
    // If there is no cached connection, create one and cache it.
    if (!cached.connection) {
        if (!cached.promise) {
            const modelPromise = (async function() {
                const knex = Knex(knexConfig)
                Model.knex(knex)
                return Model
            })();
            cached.promise = modelPromise
        }
        cached.connection = await cached.promise
    }

    // Return the cached connection.
    return cached.connection
}