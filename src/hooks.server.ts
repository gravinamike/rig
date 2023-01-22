import type { Handle } from "@sveltejs/kit"
import { getDatabaseConnection } from "$lib/db/utility/connection"
import { retrieveSessionSpecificCookie } from "$lib/db/utility/sessionSpecificFetch"


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

	// If the request was to the database API,
	if ( event.url.pathname.startsWith("/api/db/") ) {

		// Retrieve the name of the Graph file from the cookies.
		const graphName = retrieveSessionSpecificCookie(event.request, "graphName")

		// Get a database connection to that Graph file.
		if (graphName) await getDatabaseConnection(graphName)			

	// Else, if the request was sent to the create-Graph API,
	} else if ( event.request.method === "POST" && event.url.pathname.startsWith("/api/file/createGraph") ) {

		// Retrieve the name of the Graph file from the request body.
		const body = await event.request.clone().json()

		// Create that Graph file and get a database connection to it.
		await getDatabaseConnection(body.newGraphName, null, true)

	}

	// Resolve a response from the event, and return it to the client.
	const response = await resolve(event)
	return response
}