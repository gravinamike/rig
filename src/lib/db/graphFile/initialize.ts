// Import session-specific fetch method.
import { sessionSpecificFetch as fetch } from "$lib/db/sessionSpecificFetch"


/**
 * Graph-is-updated method.
 * 
 * Determines whether the current Graph has been updated to work with the
 * current version of the app.
 * @returns - Whether or not the Graph has been updated.
 */
export async function graphIsUpdated(): Promise<boolean | null> {
    // Query the Graph-is-updated API.
    const res = await fetch(`api/db/graphFile/graphIsUpdated`)

    // If the response is ok,
    if (res.ok) {
        // Parse and return the boolean.
        const isUpdated = await res.json() as boolean
        return isUpdated
        
    // Handle errors if needed.
    } else {
        res.text().then(text => {throw Error(text)})
        return null
    }
}

/**
 * Update-Graph method.
 * 
 * Updates the current Graph to work with the current version of the app.
 * @returns - Whether the update operation was successful.
 */
export async function updateGraph(): Promise<boolean> {
    // Post to the update-Graph API.
    const res = await fetch(
        `api/db/graphFile/updateGraph`,
        {
            method: "POST",
            body: JSON.stringify({})
        }
    )

    // Report on the response.
    if (res.ok) {
        return true
    } else {
        res.text().then(text => {throw Error(text)})
        return false
    }
}