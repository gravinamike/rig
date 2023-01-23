import { sessionSpecificFetch as fetch } from "$lib/db/utility/sessionSpecificFetch"


export async function graphIsUpdated(): Promise<boolean | null> {
    const res = await fetch(`api/db/graphFile/graphIsUpdated`)

    // If the response is ok,
    if (res.ok) {
        const isUpdated = await res.json() as boolean
        return isUpdated
    // Handle errors if needed.
    } else {
        res.text().then(text => {throw Error(text)})
        return null
    }
}

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