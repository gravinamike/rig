import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import { reorderDirection } from "$lib/server/db"
import { getGraphNameOnServer } from "$lib/server/db/utility"


export const POST: RequestHandler = async ({ request, params }) => { 
    try {
        const graphName = getGraphNameOnServer(request, params)
        const body = await request.json()
        await reorderDirection(
            graphName,
            body.directionId,
            body.newIndex
        )

        return new Response(JSON.stringify(
            {
                message: "Direction reordered successfully."
            }
        ))

    } catch(err) {
        throw error(500, `A server error occurred while attempting to reorder Direction: ${err}`)
    }
}