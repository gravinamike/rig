import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import { updateSpace } from "$lib/db/serverSide"


export const POST: RequestHandler = async ({request}) => {
    try {
        const body = await request.json()
        await updateSpace(
            body.spaceId,
            body.spaceText,
            body.halfAxisIdsAndDirections
        )
        
        return new Response(JSON.stringify(
            {
                message: "Space updated successfully."
            }
        ))

    } catch(err) {
        throw error(500, `A server error occurred while attempting to update Space: ${err}`)
    }
}