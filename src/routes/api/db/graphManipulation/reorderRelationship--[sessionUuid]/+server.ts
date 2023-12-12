import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import { reorderRelationship } from "$lib/server/db"
import { getGraphNameOnServer } from "$lib/server/db/utility"


export const POST: RequestHandler = async ({ request, params }) => {
    try {
        const graphName = getGraphNameOnServer(request, params)
        const body = await request.json()
        await reorderRelationship(
            graphName,
            body.sourceThingId,
            body.destThingId,
            body.destThingDirectionId,
            body.newIndex
        )

        return new Response(JSON.stringify(
            {
                message:"Relationship reordered successfully."
            }
        ))

    } catch(err) {
        throw error(500, `A server error occurred while attempting to reorder Relationship: ${err}`)
    }
}