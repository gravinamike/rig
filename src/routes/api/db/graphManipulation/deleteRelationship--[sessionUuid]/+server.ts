import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import { deleteRelationship } from "$lib/server/db"
import { getGraphNameOnServer } from "$lib/server/db/utility"


export const POST: RequestHandler = async ({ request, params }) => {
    try {
        const graphName = getGraphNameOnServer(request, params)
        const body = await request.json()
        await deleteRelationship(
            graphName,
            body.sourceThingId,
            body.destThingId
        )
        
        return new Response(JSON.stringify(
            {
                message: "Relationship deleted successfully."
            }
        ))

    } catch(err) {
        throw error(500, `A server error occurred while attempting to delete Relationship: ${err}`)
    }
}