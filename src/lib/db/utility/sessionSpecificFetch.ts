import { parse } from "cookie"
import { get } from "svelte/store"
import { sessionUuidStore } from "$lib/stores"


export async function sessionSpecificFetch(
    input: RequestInfo | URL,
    init?: RequestInit
): Promise< Response > {
    // Set the session UUID cookie from the store.
    document.cookie = `sessionUuid=${get(sessionUuidStore)}; SameSite=Strict;`

    // Get a response using the window's native fetch.
    const res = await fetch(input, init)

    // Clear the session UUID cookie.
    document.cookie = `sessionUuid= ; expires = Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict;`

    // Return the response.
    return res
}



export function retrieveSessionSpecificCookie(request: Request, cookieName: string) {
    const cookies = parse(request.headers.get("cookie") || "")
    const sessionUuid = cookies.sessionUuid || null
    const cookieValue = cookies[`session-${sessionUuid}-${cookieName}`] || null

    return cookieValue
}