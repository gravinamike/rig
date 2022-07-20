import type { Handle } from "@sveltejs/kit"
import { getDatabaseConnection } from "$lib/db/connection"


export const handle: Handle = async ({ event, resolve }) => {
	if ( /*event.request.method === "GET" &&*/ event.url.pathname.startsWith("/api/db/") ) {

		await getDatabaseConnection()

	} else if ( event.request.method === "POST" && event.url.pathname.startsWith("/api/file/createGraph") ) {

		const body = await event.request.clone().json()
		await getDatabaseConnection(body.newGraphName)

	}

	const response = await resolve(event, { ssr: false })
	
	return response
}
