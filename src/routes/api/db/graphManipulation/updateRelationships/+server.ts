import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import { updateRelationships } from "$lib/db/serverSide"


export const POST: RequestHandler = async ({ request }) => {
    try {
        const body = await request.json()
        await updateRelationships(body.relationshipInfos)
        
        return new Response(JSON.stringify(
            {
                message: "Relationship updated successfully."
            }
        ))

    } catch(err) {
        throw error(500, `A server error occurred while attempting to update Relationship: ${err}`)
    }
}