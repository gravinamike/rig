import { sessionSpecificFetch as fetch } from "$lib/db/sessionSpecificFetch"


export async function graphNeedsRepair(): Promise<boolean | null> {
    const res = await fetch(`api/db/graphFile/graphNeedsRepair`)

    // If the response is ok,
    if (res.ok) {
        const needsRepair = await res.json() as boolean
        return needsRepair
    // Handle errors if needed.
    } else {
        res.text().then(text => {throw Error(text)})
        return null
    }
}

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
