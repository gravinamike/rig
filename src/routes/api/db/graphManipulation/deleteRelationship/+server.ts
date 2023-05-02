import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import { deleteRelationship } from "$lib/server/db"


export const POST: RequestHandler = async ({ request }) => {
    try {
        const body = await request.json()
        await deleteRelationship(body.sourceThingId, body.destThingId)
        
        return new Response(JSON.stringify(
            {
                message: "Relationship deleted successfully."
            }
        ))

    } catch(err) {
        throw error(500, `A server error occurred while attempting to delete Relationship: ${err}`)
    }
}