import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import { createNewRelationship } from "$lib/db/serverSide"


export const POST: RequestHandler = async ({ request }) => {
    try {
        const body = await request.json()
        await createNewRelationship(body.sourceThingId, body.destThingId, body.directionId)
        
        return new Response(JSON.stringify(
            {
                message: "New Relationship created successfully."
            }
        ))

    } catch(err) {
        throw error(500, `A server error occurred while attempting to create new Relationship: ${err}`)
    }
}