// Import types.
import type { Handle, HandleServerError, RequestEvent } from "@sveltejs/kit"

// Import Sveltekit framework resources.
import { error } from "@sveltejs/kit"

// Import cookie-related resources.
import { parse } from "cookie"

// Import API methods.
import { getSessionById } from "$lib/server/auth"
import { getAuthDatabaseConnection, getDatabaseConnection } from "$lib/server/db/connection"
import { retrieveSessionSpecificCookie } from "$lib/db/sessionSpecificFetch"
import { isGraphRestrictedRoute } from "$lib/shared/constants"


import { get } from "svelte/store"
import { loggerStore } from "$lib/stores"
import { getGraphNameOnServer } from "$lib/server/db/utility"
const logger = get(loggerStore)




/**
 * Server request-handle hook.
 * 
 * All requests to the server are first passed through this method, which sets up a connection to
 * the database, specifying the appropriate file either from a cookie or from a passed argument.
 * @param param0 - An object passed by the framework containing the RequestEvent and a method to resolve it into a response.
 * @returns - The response from the server to the client.
 */
export const handle: Handle = async ({ event, resolve }) => {
	// Get the session UUID from 
	const sessionUuid = event.params.sessionUuid as string

	
	/* Add the current user's ID to the app's local variables. */

	// Retrieve all cookies from the request headers.
    const cookies = parse(event.request.headers.get("cookie") || "")

    // If there is a `session_id` cookie (meaning a session exists),
    if (cookies.session_id) {
        // Retrieve that session by its ID.
        const session = await getSessionById(cookies.session_id)

        // Add the user ID associated with that session to the app's local variables, keyed to
		// "username".
        if (session) event.locals.user = { username: session.username }
		
	// Otherwise,
    } else {
		// Add a null to the request app's local variables, keyed to "username".
		event.locals.user = null
	}

	/* If the request is forbidden, throw a 403 error. */
	const requestForbidden = await requestIsForbidden(sessionUuid, event)
	if (requestForbidden) {
		logger.info(
			{
				username: event.locals.user?.username || null,
				route: event.route.id,
				status: 403,
				msg: "User doesn't have permission to access this resource."
			}
		)
		throw error(403, "You don't have permission to access this resource.")
	}

	/* Get a database connection. */

	// If the request was to the authentication API,
	if ( event.url.pathname.startsWith("/api/auth/") ) {

		// Get a database connection to the authentication database.
		await getAuthDatabaseConnection()

	// If the request was to the any of the Graph-restricted APIs,
	} else if (isGraphRestrictedRoute(event.url.pathname)) {

		// Retrieve the name of the Graph file from the cookies.
		const graphName = retrieveSessionSpecificCookie(sessionUuid, event.request, "graphName")

		// Get a database connection to that Graph file.
		if (graphName) {
			await getDatabaseConnection(graphName)
		}

	// Else, if the request was sent to the create-Graph API,
	} else if ( event.request.method === "POST" && event.url.pathname.startsWith("/api/file/createGraph") ) {

		// Create that Graph file and get a database connection to it.
		const body = await event.request.clone().json()
		await getDatabaseConnection(`${body.username || "all"}/${body.newGraphName}`)

	}


	/* Resolve a response from the event, and return it to the client. */
	const response: Response = await resolve(event)




	if (!requestForbidden && !(event.route.id === null) && !response.ok) {
		const status = response.clone().status
		response.clone().text().then(text => {
			let errorMessage: string
			try {
				errorMessage = JSON.parse(text)["message"]
			} catch {
				errorMessage = text
			}

			// Get the client IP address, the username, and the Graph name.
			const clientIpAddress = event.getClientAddress()
			const userName = event.locals.user?.username || null
			const graphName = getGraphNameOnServer(event.request, event.params)

			logger.error(
				{
					clientIp: clientIpAddress,
					userName: userName,
					graphName: graphName,
					route: event.route.id,
					status: status,
					msg: errorMessage
				}
			)
		})
    }





	return response
}


/**
 * Request-is-forbidden method.
 * 
 * Determines if a request event should return a 404 (Forbidden) error instead of the regular
 * response.
 * 
 * @param event - The request event.
 * @returns - Boolean indicating whether or not the request it forbidden.
 */
async function requestIsForbidden(
	sessionUuid: string,
	event: RequestEvent< Partial<Record<string, string>>, string | null >
) {
	let requestIsForbidden = false

	// If the request URL is one of the Graph-restricted paths,
	if (isGraphRestrictedRoute(event.url.pathname)) {
		// Get the Graph name and its owner's username from the session-
		// specific cookie.
		const graphName = retrieveSessionSpecificCookie(sessionUuid, event.request, "graphName")
		const usernameFromGraphName = graphName?.split("/")[0] || null

		// If...
		if (
			// ...there is no Graph currently open...
			!graphName
			// ...or...
			|| (
				// ...there is a Graph currently open...
				graphName
				// ...and that Graph is neither a public Graph nor owned by the
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
			requestIsForbidden = true
		}
	}

	// If the request is for the create-Graph endpoint,
	if ( event.url.pathname.startsWith("/api/file/createGraph") ) {
		// Get a copy of the request body.
		const body = await event.request.clone().json()

		// If the to-be-created Graph is neither a public Graph nor one that
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
	// check for is neither the public user nor the signed-in user, the request
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


/**
 * Server unexpected-error hook.
 * 
 * All unexpected errors (those errors not thrown with the SvelteKit `error` function) that happen
 * during loading or rendering on the server pass through this hook. It allows such errors to be
 * logged and also stripped of any sensitive information (like stack traces) before being passed
 * on.
 * @param error - The error that caused the hook to be invoked.
 * @param event - The request event that caused the error.
 * @returns - An object conforming to the application's error interface.
 */
export const handleError: HandleServerError = async ({ error, event }) => {
	let errorMessage: string

	try {
		// Get the client IP address, the username, and the Graph name.
		const clientIpAddress = event.getClientAddress()
		const userName = event.locals.user?.username || null
		const graphName = getGraphNameOnServer(event.request, event.params)

		// Get the error message from the error.
		errorMessage = `An unexpected error happened during loading/rendering: ${(error as {message: string}).message}`
			
		// Log the error.
		logger.error(
			{
				clientIp: clientIpAddress,
				username: userName,
				graphName: graphName,
				route: event.route.id,
				msg: errorMessage
			}
		)
	} catch {
		// On any error in the above try block, fall back to a generic error message and skip
		// logging.
		errorMessage =
			"An unexpected error occurred, and another error occurred while attempting to handle it in the server-side hooks."
	}

	// Return an application error object.
	return {
		message: errorMessage
	}
}