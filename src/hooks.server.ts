import type { Handle } from "@sveltejs/kit"
import { parse } from "cookie"
import { getDatabaseConnection } from "$lib/db/connection"
//import { stringRepresentsInteger } from "$lib/shared/utility"


export const handle: Handle = async ({ event, resolve }) => {

	const cookies = parse(event.request.headers.get("cookie") || "")
	const graphName = cookies.graphName || null
	/*const pThingId =
		cookies.pThingId && stringRepresentsInteger(cookies.pThingId) ? parseInt(cookies.pThingId) :
		null*/


	if (graphName) {
		
		if ( /*event.request.method === "GET" &&*/ event.url.pathname.startsWith("/api/db/") ) {
			
			await getDatabaseConnection(graphName)
	
		} else if ( event.request.method === "POST" && event.url.pathname.startsWith("/api/file/createGraph") ) {
	
			const body = await event.request.clone().json()
			await getDatabaseConnection(body.newGraphName, null, true)
	
		}

	}

	const response = await resolve(event)
	
	return response
}
