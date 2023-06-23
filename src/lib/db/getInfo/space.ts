// Import session-specific fetch.
import { sessionSpecificFetch as fetch } from "$lib/db/sessionSpecificFetch"


/**
 * Direction-is-referenced method.
 * 
 * Determine if a Direction is referenced in any other constructs (for example,
 * set as the opposite of another Direction, or set as a member of a Space).
 * @param directionId - The ID of the Direction.
 * @returns - Whether the Direction is reference in any other constructs.
 */
export async function directionIsReferenced(directionId: number): Promise<boolean> {
    // Query the Direction-is-referenced API.
    const res = await fetch(`api/db/graphConstructs/direction-is-referenced-${directionId}`)

    // If the response is ok,
    if (res.ok) {
        // Parse and return the response as a boolean.
        const isReferenced = await res.json() as boolean
        return isReferenced

    // Handle errors if needed.
    } else {
        res.text().then(text => {throw Error(text)})
        return false
    }
}

/**
 * Space-is-referenced method.
 * 
 * Determine if a Space is referenced in any other constructs (for example, set
 * as the default Space of any Things).
 * @param directionId - The ID of the Space.
 * @returns - Whether the Space is reference in any other constructs.
 */
export async function spaceIsReferenced(spaceId: number): Promise<boolean> {
    // Query the Space-is-referenced API.
    const res = await fetch(`api/db/graphConstructs/space-is-referenced-${spaceId}`)

    // If the response is ok,
    if (res.ok) {
        // Parse and return the response as a boolean.
        const isReferenced = await res.json() as boolean
        return isReferenced

    // Handle errors if needed.
    } else {
        res.text().then(text => {throw Error(text)})
        return false
    }
}