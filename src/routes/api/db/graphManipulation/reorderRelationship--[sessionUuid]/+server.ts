import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import { reorderRelationship } from "$lib/server/db"


export const POST: RequestHandler = async ({ request }) => {
    try {
        const body = await request.json()
        await reorderRelationship(
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