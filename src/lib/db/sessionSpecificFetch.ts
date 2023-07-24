import { parse } from "cookie"
import { get } from "svelte/store"
import { v4 as uuidv4 } from "uuid"
import { sessionUuidStore } from "$lib/stores"


// The session-specific fetch carries the session ID along with it, via a
// temporary cookie (that only lasts as long as the fetch itself). This
// allows different browser sessions to view and alter different Graphs
// simultaneously from the same back-end instance without affecting each
// other.
export async function sessionSpecificFetch(
    input: RequestInfo | URL,
    init?: RequestInit
): Promise< Response > {

    // Create a UID for the fetch call. (We include a fetch UID so that the
    // cookie can be uniquely identified and then deleted immediately after the
    // fetch without accidentally deleting it for other session-specific fetch
    // calls that are overlapping in time with this one.
    const fetchUuid = uuidv4()

    // Set the session UUID cookie from the store.
    document.cookie = `sessionUuid-${fetchUuid}=${get(sessionUuidStore)}; expires = Thu, 01 Jan 2099 00:00:01 GMT; path=/; SameSite=Strict;`
    
    // Get a response using the window's native fetch.
    const res = await fetch(input, init)

    // Clear the session UUID cookie.
    document.cookie = `sessionUuid-${fetchUuid}= ; expires = Thu, 01 Jan 1970 00:00:01 GMT; path=/; SameSite=Strict;`

    // Return the response.
    return res
}



export function retrieveSessionSpecificCookie(request: Request, cookieName: string) {
    const cookies = parse(request.headers.get("cookie") || "")
    const sessionUuidCookies = Object.entries(cookies).filter(entry => entry[0].includes("sessionUuid"))
    const sessionUuid = sessionUuidCookies.length ? sessionUuidCookies[0][1] : null
    const cookieValue = cookies[`session-${sessionUuid}-${cookieName}`] || null

    return cookieValue
}