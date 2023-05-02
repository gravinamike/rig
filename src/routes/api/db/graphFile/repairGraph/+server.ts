import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import { repairGraph } from "$lib/server/db/graphFile/repair"


export const POST: RequestHandler = async () => {
    try {
        await repairGraph()
        
        return new Response(JSON.stringify(
            {
                message: "Graph database repaired successfully."
            }
        ))

    } catch(err) {
        throw error(500, `A server error occurred while attempting to repair Graph database: ${err}`)
    }
}