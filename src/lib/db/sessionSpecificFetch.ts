// Import Sveltekit framework resources.
//import { error } from "@sveltejs/kit"
import { get } from "svelte/store"

// Import cookie-related resources.
import { parse } from "cookie"

// Import UUID-related resources.
//import { v4 as uuidv4 } from "uuid"

// Import stores.
import { sessionUuidStore } from "$lib/stores"
import { graphRestrictedPaths } from "$lib/shared/constants"



/**
 * Session-specific fetch method.
 * 
 * The session-specific fetch carries the session ID along with it, via a
 * temporary cookie (that only lasts as long as the fetch itself). This
 * allows different browser sessions to view and alter different Graphs
 * simultaneously from the same back-end instance without affecting each
 * other.
 * @param input - The URL to fetch.
 * @returns - The response to the fetch request.
 */
export async function sessionSpecificFetch(
    input: RequestInfo | URL,
    init?: RequestInit
): Promise< Response > {
    // Clear any inappropriately-"lingering" cookies from previous session-specific fetches that
    // didn't finish correctly.
    //clearSessionSpecificCookies()

    // Create a UID for the fetch call. (We include a fetch UID so that the cookie can be uniquely
    // identified and then deleted immediately after the fetch without accidentally deleting it
    // during other session-specific fetch calls that are overlapping in time with this one.
    //const fetchUuid = uuidv4()

    // Set the session UUID cookie from the store.
    //document.cookie = `sessionUuid-for-fetch-uuid-${fetchUuid}=${get(sessionUuidStore)}; expires = Thu, 01 Jan 2099 00:00:01 GMT; path=/; SameSite=Strict;`





    //console.log(typeof input)
    const isGraphRestrictedPath = (
		graphRestrictedPaths.some(
			path => {
				//return (input as URL).pathname.startsWith(path)
                return (
                    String(input).startsWith(path)
                    || String(input).startsWith(path.replace(/^\//, ""))
                )
			}
		)
	)
    //console.log(isGraphRestrictedPath, input, graphRestrictedPaths)
    const inputWithSessionUuidParam =
        isGraphRestrictedPath ? `${input}-${get(sessionUuidStore)}` :
        input
    



    // Get a response using the window's native fetch.
    const res = await fetch(
        inputWithSessionUuidParam,
        init
    )

    // Clear the session UUID cookie.
    //document.cookie = `sessionUuid-for-fetch-uuid-${fetchUuid}= ; expires = ${(new Date()).toUTCString()}; path=/; SameSite=Strict;`

    // Return the response.
    return res
}



/**
 * Clear-session-specific-cookies method.
 * 
 * Occasionally a session-specific cookie may be created by the sessionSpecificFetch() function,
 * but not properly destroyed afterwards (for example, if the fetch causes the app to crash first).
 * These "lingering" cookies then interfere with future session-specific fetch operations. This
 * function can be run to clear out such lingering cookies before a session-specific fetch.
 */
/*export function clearSessionSpecificCookies() {

    // Get all the cookies.
    const cookies = parse(document.cookie)

    // Get only those cookies that contain the session UUID for a fetch.
    const sessionUuidCookies = Object.entries(cookies).filter(entry => entry[0].includes("sessionUuid-for-fetch-uuid-"))
    
    // For each such cookie, clear it.
    for (const sessionUuidCookie of sessionUuidCookies) {
        const cookieKey = sessionUuidCookie[0]
        document.cookie = `${cookieKey}= ; expires = ${(new Date()).toUTCString()}; path=/; SameSite=Strict;`
    }
}*/


export function retrieveSessionSpecificCookie(sessionUuid: string, request: Request, cookieName: string) {
    // Get all the cookies.
    const cookies = parse(request.headers.get("cookie") || "")

    // Get only those cookies that contain the session UUID for a fetch. (There should be exactly
    // one, so if there are more or fewer than one, throw an error.)
    //const sessionUuidCookies = Object.entries(cookies).filter(entry => entry[0].includes("sessionUuid-for-fetch-uuid-"))
    //if (sessionUuidCookies.length !== 1) throw error(500, `Incorrect number of session UUID cookies (there should be exactly 1, but ${sessionUuidCookies.length} were found).`)

    // Get the session UUID from the cookie.
    //const sessionUuid = sessionUuidCookies[0][1]

    // Get the value of the specified cookie for the session with that UUID, and return it.
    const cookieValue = cookies[`${cookieName}-for-sessionUuid-${sessionUuid}`] || null
    return cookieValue
}