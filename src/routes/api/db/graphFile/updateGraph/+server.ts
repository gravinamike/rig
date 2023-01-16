import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import { initializeOrUpdateGraph } from "$lib/db/serverSide/graphFile/initialize"


export const POST: RequestHandler = async () => {
    try {
        await initializeOrUpdateGraph()
        
        return new Response(JSON.stringify(
            {
                message: "Graph database updated successfully."
            }
        ))

    } catch(err) {
        throw error(500, `A server error occurred while attempting to update Graph database: ${err}`)
    }
}