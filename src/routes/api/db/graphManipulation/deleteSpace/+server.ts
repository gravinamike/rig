import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import { deleteSpace } from "$lib/db/serverSide"


export const POST: RequestHandler = async ({ request }) => {
    try {
        const body = await request.json()
        await deleteSpace(body.spaceIdToDelete)
        
        return new Response(JSON.stringify(
            {
                message: "Space deleted successfully."
            }
        ))

    } catch(err) {
        throw error(500, `A server error occurred while attempting to delete Space: ${err}`)
    }
}