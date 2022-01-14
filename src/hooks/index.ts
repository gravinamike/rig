import type { Handle } from "@sveltejs/kit"
import { getDatabaseConnection } from "$lib/db/connection"


export const handle: Handle = async ({ request, resolve }) => {
	if ( request.method === "GET" && request.path.startsWith("/api/") ) await getDatabaseConnection()

	const response = await resolve(request)
	
	return response
}
