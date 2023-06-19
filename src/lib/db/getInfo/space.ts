// Import session-specific fetch.
import { sessionSpecificFetch as fetch } from "$lib/db/sessionSpecificFetch"


/*
 * Determine if a Direction is referenced in any other constructs (for example,
 * set as the opposite of another Direction, or set as a member of a Space).
 */
export async function directionIsReferenced(directionId: number): Promise<boolean> {
    const res = await fetch(`api/db/graphConstructs/direction-is-referenced-${directionId}`)

    // If the response is ok,
    if (res.ok) {
        const isReferenced = await res.json() as boolean
        return isReferenced

    // Handle errors if needed.
    } else {
        res.text().then(text => {throw Error(text)})
        return false
    }
}

/*
 * Determine if a Space is referenced in any other constructs (for example, set
 * as the default Space of any Things).
 */
export async function spaceIsReferenced(spaceId: number): Promise<boolean> {
    const res = await fetch(`api/db/graphConstructs/space-is-referenced-${spaceId}`)

    // If the response is ok,
    if (res.ok) {
        const isReferenced = await res.json() as boolean
        return isReferenced

    // Handle errors if needed.
    } else {
        res.text().then(text => {throw Error(text)})
        return false
    }
}