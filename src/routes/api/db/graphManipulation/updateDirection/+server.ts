import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import { updateDirection } from "$lib/server/db"


export const POST: RequestHandler = async ({ request }) => {
    try {
        const body = await request.json()
        await updateDirection(
            body.directionId,
            body.directionText,
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