import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import { createNewRelationship } from "$lib/server/db"
import { getGraphNameOnServer } from "$lib/server/db/utility"


export const POST: RequestHandler = async ({ request, params }) => {
    try {
        const graphName = getGraphNameOnServer(request, params)
        const body = await request.json()
        await createNewRelationship(
            graphName,
            body.sourceThingId,
            body.destThingId,
            body.directionId
        )
        
        return new Response(JSON.stringify(
            {
                message: "New Relationship created successfully."
            }
        ))

    } catch(err) {
        throw error(500, `A server error occurred while attempting to create new Relationship: ${err}`)
    }
}