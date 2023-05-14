import type { UserCredentials } from "./_types"
import path from "path"
import { Model } from "objection"
import Knex from "knex"


// Create a Knex instance to handle the database connection.
const knex = Knex({
    client: "sqlite3",
    useNullAsDefault: true,
    connection: {
        filename: path.resolve("static/auth/authentication.db")
    }
})

// Hand the Knex instance off to Objection.js.
Model.knex(knex)


/**
 * User database model.
 * 
 * Represents a user record in the authentication database.
 */
export class UserDbModel extends Model {
    static tableName = "users" as const

    username!: string
    hashedPassword!: string
}

/**
 * Get-user-database-model-by-username method.
 * 
 * Retrieves the user database model by username (or null if no match is found).
 * @param username - The username string.
 * @returns - The user's authentication credentials, or null if no match is found.
 */
export async function userDbModelByUsername(username: string): Promise< UserDbModel | null > {
    // Get an array of database records matching the username.
    const userModels = await UserDbModel.query().where("username", username)
    
    // Return the first match, or null if no matches were found.
    return (
        userModels.length ? userModels[0] :
        null
    )
}

/**
 * Add-user-to-database method.
 * @param userCredentials - The user credentials to add to the authentication database.
 */
export async function addUserToDb(userCredentials: UserCredentials): Promise< void > {
    // Add a new user record to the database based on the credentials.
    await UserDbModel.query().insert(userCredentials)
}