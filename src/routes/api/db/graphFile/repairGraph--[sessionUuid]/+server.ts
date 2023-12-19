import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import { repairGraph } from "$lib/server/db/graphFile/repair"

import { get } from "svelte/store"
import { loggerStore } from "$lib/stores"
import { getGraphNameOnServer, logServerError } from "$lib/server/db/utility"
const logger = get(loggerStore)



export const POST: RequestHandler = async ( event ) => {
    // Get the client IP address, the username, and the Graph name.
    const clientIpAddress = event.getClientAddress()
    const userName = event.locals.user?.username || null
    const graphName = getGraphNameOnServer(event.request, event.params)

    try {
        await repairGraph()
        
        logger.info(
			{
				clientIp: clientIpAddress,
                userName: userName,
                graphName: graphName,
				route: event.route.id,
				msg: "Graph database repaired successfully."
			}
		)

        return new Response(JSON.stringify(
            {
                message: "Graph database repaired successfully."
            }
        ))

    } catch(err) {
        logServerError(
            "A server error occurred while attempting to repair Graph database.",
            {
                clientIp: clientIpAddress,
                userName: userName,
                graphName: graphName
            },
            err as Error
        )
        throw error(500, `A server error occurred while attempting to repair Graph database: ${err}`)
    }
}