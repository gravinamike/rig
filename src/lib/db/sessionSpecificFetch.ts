// Import Sveltekit framework resources.
import { get } from "svelte/store"

// Import cookie-related resources.
import { parse } from "cookie"

// Import stores.
import { sessionUuidStore } from "$lib/stores"
import { isGraphRestrictedRoute } from "$lib/shared/constants"



/**
 * Session-specific fetch method.
 * 
 * The session-specific fetch carries the session ID along with it, via a route param that is added
 * to the actually-requested route. This allows different browser sessions to view and alter
 * different Graphs simultaneously from the same back-end instance without affecting each other, by
 * using the `retrieveSessionSpecificCookie` method and the passed-along session ID to access
 * Graph information stored in session-specific cookies.
 * @param input - The URL to fetch.
 * @returns - The response to the fetch request.
 */
export async function sessionSpecificFetch(
    input: RequestInfo | URL,
    init?: RequestInit
): Promise< Response > {

    // If the route is "Graph-restricted" (meaning it requires the session UUID to determine what
    // Graph to use and whether the route is prohibited), add the session UUID as a route param at
    // the end. Otherwise, use the supplied route.
    const inputToUse =
    isGraphRestrictedRoute(String(input)) ? `${input}-${get(sessionUuidStore)}` :
        input
    
    // Get a response using the window's native fetch.
    const res = await fetch(inputToUse, init)

    // Return the response.
    return res
}

/**
 * Retrieve-session-specific-cookie method.
 * 
 * Allows server-side API methods to get Graph-specific information from cookies, by using the
 * session UUID as a key to filter for only those cookies that relate to that Graph.
 * @param sessionUuid - The session UUID to retrieve cookies for.
 * @param request - The request that this method is being used to retrieve cookies for.
 * @param cookieName - The name of the cookie to retrieve. (This is a fragment of the cookie key specifying what information it contains, such as "graph".)
 * @returns - The value of the requested cookie for the specified session/Graph.
 */
export function retrieveSessionSpecificCookie(sessionUuid: string, request: Request, cookieName: string) {
    // Get all the cookies.
    const cookies = parse(request.headers.get("cookie") || "")

    // Get the value of the specified cookie for the session with that UUID, and return it.
    const cookieValue = cookies[`${cookieName}-for-sessionUuid-${sessionUuid}`] || null
    return cookieValue
}