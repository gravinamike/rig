import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import { deleteThing } from "$lib/server/db"
import { getGraphNameOnServer } from "$lib/server/db/utility"


export const POST: RequestHandler = async ({ request, params }) => {
    try {
        const graphName = getGraphNameOnServer(request, params)
        const body = await request.json()
        await deleteThing(
            graphName,
            body.thingIdToDelete
        )
        
        return new Response(JSON.stringify(
            {
                message: "Thing deleted successfully."
            }
        ))

    } catch(err) {
        throw error(500, `A server error occurred while attempting to delete Thing: ${err}`)
    }
}