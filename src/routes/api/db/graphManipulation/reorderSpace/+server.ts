import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import { reorderSpace } from "$lib/db/serverSide"


export const POST: RequestHandler = async ({ request }) => {    
    try {
        const body = await request.json()
        await reorderSpace(
            body.spaceId,
            body.newIndex
        )

        return new Response(JSON.stringify(
            {
                message: "Space reordered successfully."
            }
        ))

    } catch(err) {
        throw error(500, `A server error occurred while attempting to reorder Space: ${err}`)
    }
}