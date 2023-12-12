import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import { updateSpace } from "$lib/server/db"
import { getGraphNameOnServer } from "$lib/server/db/utility"


export const POST: RequestHandler = async ({request, params}) => {
    try {
        const graphName = getGraphNameOnServer(request, params)
        const body = await request.json()
        await updateSpace(
            graphName,
            body.spaceId,
            body.spaceText,
            body.spaceBuildMethod,
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