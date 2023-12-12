import type { UserCredentials } from "./_types"
import { hash, compare } from "bcrypt"
import { addUserToDb, userDbModelByUsername } from "./models"
import { createUserFolder } from "$lib/shared/fileSystem"
import { get } from "svelte/store"
import { loggerStore } from "$lib/stores"
const logger = get(loggerStore)


/**
 * Register-new-user method.
 * 
 * @param userCredentials - The new user's credentials object.
 * @returns - The new user's credentials object, or an error.
 */
export async function registerNewUser( userCredentials: UserCredentials ): Promise< UserCredentials | Error > {
    // Determine if the user already exists.
    const matchingUser = await userDbModelByUsername(userCredentials.username)

    // If the user already exists, return an error message.
    if (matchingUser) {
        return new Error("User already exists.")
        
    // Otherwise,
    } else {
        // Add the new user to the database.
        await addUserToDb(userCredentials)

        // Create the corresponding user folder.
        await createUserFolder(userCredentials.username)

        logger.info(`Successfully signed up user "${userCredentials.username}".`)

        // Return the user credentials.
        return userCredentials
    }
}

/**
 * Get-user-credentials-by-username method.
 * 
 * @param username - A username string.
 * @returns - The matching user credentials object, or null if none was found.
 */
export async function getUserByUsername( username: string ): Promise< UserCredentials | null > {
    // Retrieve the matching user credentials object, or null if none was found.
    const matchingUser = await userDbModelByUsername(username)

    // Return the user credentials (or null).
    return matchingUser
}

/**
 * Hash-password method.
 * Hash and salt a plaintext password.
 * 
 * @param plaintextPassword - An un-hashed password string.
 * @returns - A hashed password string.
 */
export async function hashPassword( plaintextPassword: string ): Promise< string | null > {
    let hashedPassword: string | null = null

    await hash(plaintextPassword, 10)
        .then(hash => hashedPassword = hash)
        .catch(err => logger.error({
            msg: `Error when attempting to hash password: ${err}`
        }))
        
    return hashedPassword
}

/**
 * Validate-password method.
 * Determine whether a plaintext password matches a hashed password.
 * 
 * @param plaintextPassword - An un-hashed password.
 * @param hashedPassword - A hashed password string.
 * @returns - Whether or not they match.
 */
export async function validatePassword( plaintextPassword: string, hashedPassword: string ): Promise< boolean > {
    const validated = await compare(plaintextPassword, hashedPassword)
    return validated
}