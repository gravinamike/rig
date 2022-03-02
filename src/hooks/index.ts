import type { Handle } from "@sveltejs/kit"
import { getDatabaseConnection } from "$lib/db/connection"


export const handle: Handle = async ({ event, resolve }) => {
	if ( event.request.method === "GET" && event.url.pathname.startsWith("/api/") ) await getDatabaseConnection()

	const response = await resolve(event)
	
	return response
}
