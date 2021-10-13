import Knex from 'knex'
import pkg from 'objection'
const { Model, knexSnakeCaseMappers } = pkg

interface H2 { conn: typeof Model | null, promise: Promise<typeof Model> | null }


/**
 * Global used to keep a cached connection across hot reloads
 * in dev mode, preventing costly multiplication of connections.
 */
/* eslint-disable-next-line no-var */
declare var global: { h2: H2 }
let cached: H2
if ('h2' in global && global.h2) {
    cached = global.h2
} else {
    cached = global.h2 = { conn: null, promise: null }
}


export async function connectToDatabase(): Promise<typeof Model> {
    if (cached.conn) {
        return cached.conn
    }

    if (!cached.promise) {
        const modelPromise = (async function() {
            const knex = Knex({
                client: 'pg',
                version: '1.4',
                connection: {
                    user: 'sa',
                    host: '192.168.0.102',
                    database: 'C:/Users/mtgra/Desktop/LifeSeahorse_test/LifeGrid_graph/graph',
                    password: 'goodguess',
                    port: 5435,
                },
                ...knexSnakeCaseMappers({ upperCase: true })
            })

            Model.knex(knex)

            return Model
        })();

        cached.promise = modelPromise
    }
    
    cached.conn = await cached.promise
    return cached.conn
}