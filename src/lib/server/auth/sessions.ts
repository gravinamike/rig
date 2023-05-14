import type { SessionInfo } from "./_types"
import { v4 as uuidv4 } from "uuid"



// Array of active session-info objects.
let sessions: SessionInfo[] = []


/**
 * Create-new-session method.
 * Creates a new session for the specified username.
 * 
 * @param username - The user's identifying string.
 * @returns - The session-info object.
 */
 export async function createNewSession( username: string ): Promise< SessionInfo > {
    // Create a new session-info object with session ID and username.
    const session = {
        id: uuidv4(),
        username: username
    }

    // Add the session-info object to the array.
    sessions.push(session)

    // Return the session-info object.
    return session
}

/**
 * Get-session-by-session-ID method.
 * Retrieves an existing session-info object by session ID.
 * 
 * @param id - The ID of the session to retrieve.
 * @returns - The session-info object, or null if none exists for that ID.
 */
export async function getSessionById( id: string ): Promise< SessionInfo | null > {
    // Retrieve the session-info object by session ID.
    const session = sessions.find((session) => session.id === id)

    // Return the session-info object, or null if none exists for that ID.
    return !session ? null : session
}

/**
 * Remove-session-by-ID method.
 * Removes an existing session-info object by session ID.
 * 
 * @param id - The ID of the session to remove.
 * @returns - The session-info object, or an error if none was found for that ID.
 */
 export async function removeSession(id: string): Promise< SessionInfo | Error > {
    // Retrieve the session -nfo object by sessionID.
    const session = sessions.find((session) => session.id === id)

    // If the session ID wasn't found, return an error.
    if (!session) {
        return new Error("No session found with that ID")
    // Otherwise, remove the session-info object from the array, then return it.
    } else {
        sessions = sessions.filter((session) => session.id !== id)
        
        return session
    }
}