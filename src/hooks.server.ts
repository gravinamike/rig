import type { Handle, RequestEvent } from "@sveltejs/kit"
import { parse } from "cookie"
import { error } from "@sveltejs/kit"
import { getSessionById } from "$lib/server/auth"
import { getAuthDatabaseConnection, getDatabaseConnection } from "$lib/server/db/connection"
import { retrieveSessionSpecificCookie } from "$lib/db/sessionSpecificFetch"


/**
 * Server hook handle.
 * 
 * All requests to the server are first passed through this method, which sets
 * up a connection to the database, specifying the appropriate file either from
 * a cookie or from a passed parameter.
 * @param param0 - An object passed by the framework containing the RequestEvent and a method to resolve it into a response.
 * @returns - The response from the server to the client.
 */
export const handle: Handle = async ({ event, resolve }) => {

	/** Identify user. */

	// Retrieve cookies from the request headers.
    const cookies = parse(event.request.headers.get("cookie") || "")

    // If cookies say that a session exists,
    if (cookies.session_id) {
        // Retrieve that session by ID.
        const session = await getSessionById(cookies.session_id)
        // Add user identifier to the request event's locals as "user".
        if (session) {
            event.locals.user = { username: session.username }
        }
		
	// Otherwise,
    } else {
		// Add a null to the request event's locals as "user".
		event.locals.user = null
	}

	
	/** If the request is forbidden, throw a 403 error. */
	if (await requestIsForbidden(event)) throw error(403, "You don't have permission to access this resource.")


	/** Get database connection. */

	// If the request was to the authentication API,
	if ( event.url.pathname.startsWith("/api/auth/") ) {

		// Get a database connection to the authentication database.
		await getAuthDatabaseConnection()

	// If the request was to the database API,
	} else if ( event.url.pathname.startsWith("/api/db/") ) {

		// Retrieve the name of the Graph file from the cookies.
		const graphName = retrieveSessionSpecificCookie(event.request, "graphName")

		// Get a database connection to that Graph file.
		if (graphName) {
			await getDatabaseConnection(graphName)
		}

	// Else, if the request was sent to the create-Graph API,
	} else if ( event.request.method === "POST" && event.url.pathname.startsWith("/api/file/createGraph") ) {

		// Create that Graph file and get a database connection to it.
		const body = await event.request.clone().json()
		await getDatabaseConnection(`${body.username || "all"}/${body.newGraphName}`, null, true)

	}


	/* Resolve a response from the event, and return it to the client. */
	const response = await resolve(event)
	return response
}


/**
 * Request-is-forbidden method.
 * Determines if a request event should return a 404 (Forbidden) error instead
 * of the regular response.
 * 
 * @param event - The request event.
 * @returns - Boolean indicating whether or not the request it forbidden.
 */
async function requestIsForbidden(
	event: RequestEvent<Partial<Record<string, string>>, string | null>
) {
	let requestIsForbidden = false

	// Array of paths that are relative to a specific Graph and should be
	// forbidden when the user is not authorized for that Graph.
	const graphRestrictedPaths = [
		"/api/db/graphConstructs",
		"/api/db/graphFile",
		"/api/db/graphManipulation",
		"/api/file/attachmentsFolder-",
		"/api/file/graphConfig"
	]

	// If the request URL is one of the Graph-restricted paths,
	if ( graphRestrictedPaths.some(path => {return event.url.pathname.startsWith(path)}) ) {
		// Get the Graph name and its owner's username from the session-
		// specific cookie.
		const graphName = retrieveSessionSpecificCookie(event.request, "graphName")
		const usernameFromGraphName = graphName?.split("/")[0] || null

		// If...
		if (
			// ...there is no Graph currently open...
			!graphName
			// ...or...
			|| (
				// ...there is a Graph currently open...
				graphName
				// ...and that Graph is neither a common Graph nor owned by the
				// signed-in user,
				&& !(
					usernameFromGraphName === "all"
					|| (
						usernameFromGraphName
						&& event.locals.user?.username === usernameFromGraphName
					)
				)
			)
		// The request is forbidden.
		) {
			console.log(
				"GRAPH NAME:", graphName,
				"USERNAME FROM GRAPH NAME:", usernameFromGraphName,
				"SIGNED IN USER NAME:", event.locals.user?.username
			)
			requestIsForbidden = true
		}
	}

	// If the request is for the create-Graph endpoint,
	if ( event.url.pathname.startsWith("/api/file/createGraph") ) {
		// Get a copy of the request body.
		const body = await event.request.clone().json()

		// If the to-be-created Graph is neither a common Graph nor one that
		// belongs to the signed-in user, the request is forbidden.
		if (
			!(
				body.username === null
				|| (
					body.username !== null
					&& (event.locals.user?.username || null) === body.username
				)
			)
		) requestIsForbidden = true
	}

	// If the request is for the Graph-folders-list endpoint and the user to
	// check for is neither the common user nor the signed-in user, the request
	// is forbidden.
	if (
		event.url.pathname.startsWith("/api/file/graphFolders-")
		&& !(
			event.params.username === "all"
			|| (
				event.params.username
				&& (event.locals.user?.username || null) === event.params.username
			)
		)
	) {
		requestIsForbidden = true
	}

	return requestIsForbidden
}