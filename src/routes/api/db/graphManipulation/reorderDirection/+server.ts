import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import { reorderDirection } from "$lib/server/db"


export const POST: RequestHandler = async ({ request }) => { 
    try {
        const body = await request.json()
        await reorderDirection(
            body.directionId,
            body.newIndex
        )

        return new Response(JSON.stringify(
            {
                message: "Direction reordered successfully."
            }
        ))

    } catch(err) {
        throw error(500, `A server error occurred while attempting to reorder Direction: ${err}`)
    }
}