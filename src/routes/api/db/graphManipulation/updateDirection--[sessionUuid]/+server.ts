import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import { updateDirection } from "$lib/server/db"
import { getGraphNameOnServer } from "$lib/server/db/utility"


export const POST: RequestHandler = async ({ request, params }) => {
    try {
        const graphName = getGraphNameOnServer(request, params)
        const body = await request.json()
        await updateDirection(
            graphName,
            body.directionId,
            body.relationshipText,
            body.nameForObjects,
            body.oppositeId
        )
        
        return new Response(JSON.stringify(
            {
                message: "Direction updated successfully."
            }
        ))

    } catch(err) {
        throw error(500, `A server error occurred while attempting to update Direction: ${err}`)
    }
}