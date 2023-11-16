// Import session-specific fetch method.
import { sessionSpecificFetch as fetch } from "$lib/db/sessionSpecificFetch"


/**
 * Graph-needs-repair method.
 * 
 * Determines whether the Graph needs repair for issues like multiple
 * Directions being assigned to the same half-axis for a given Space.
 * @returns - Whether or not the Graph needs repair.
 */
export async function graphNeedsRepair(): Promise<boolean | null> {
    // Query the Graph-needs-repair API.
    const res = await fetch(`/api/db/graphFile/graphNeedsRepair`)

    // If the response is ok,
    if (res.ok) {
        // Parse and return the boolean.
        const needsRepair = await res.json() as boolean
        return needsRepair
        
    // Handle errors if needed.
    } else {
        res.text().then(text => {throw Error(text)})
        return null
    }
}

/**
 * Repair-Graph method.
 * 
 * Repairs the current Graph for issues like multiple Directions being assigned
 * to the same half-axis for a given Space.
 * @returns - Whether the repair operation was successful.
 */
export async function repairGraph(): Promise<boolean> {
    // Post to the repair-Graph API.
    const res = await fetch(
        `api/db/graphFile/repairGraph`,
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