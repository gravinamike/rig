import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import { deleteDirection } from "$lib/db/serverSide"


export const POST: RequestHandler = async ({ request }) => {
    try {
        const body = await request.json()
        await deleteDirection(body.spaceIdToDelete)
        
        return new Response(JSON.stringify(
            {
                message: "Direction deleted successfully."
            }
        ))

    } catch(err) {
        throw error(500, `A server error occurred while attempting to delete Direction: ${err}`)
    }
}