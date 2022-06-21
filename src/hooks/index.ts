import type { Handle } from "@sveltejs/kit"
import { getDatabaseConnection } from "$lib/db/connection"


export const handle: Handle = async ({ event, resolve }) => {
	console.log("TRY?", event.url.pathname)
	if ( event.request.method === "GET" && event.url.pathname.startsWith("/api/db/") ) {
		console.log("TRYING")
		await getDatabaseConnection()
		console.log("TRYING2")
	}

	const response = await resolve(event, { ssr: false })
	
	return response
}
