import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import { markThingsVisited } from "$lib/server/db"
import { getGraphNameOnServer } from "$lib/server/db/utility"


export const POST: RequestHandler = async ({ request, params }) => {
    try {
        const graphName = getGraphNameOnServer(request, params)
        const body = await request.json()
        await markThingsVisited(
            graphName,
            body.thingIdsToMarkVisited
        )
        
        return new Response(JSON.stringify(
            {
                message: "Thing(s) marked as visited."
            }
        ))

    } catch(err) {
        throw error(500, `A server error occurred while attempting to mark Thing(s) as visited: ${err}`)
    }
}