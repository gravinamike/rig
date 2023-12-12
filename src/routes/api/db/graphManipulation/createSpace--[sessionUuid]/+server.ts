import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import { createSpace } from "$lib/server/db"
import { getGraphNameOnServer } from "$lib/server/db/utility"


export const POST: RequestHandler = async ({request, params}) => {
    try {
        const graphName = getGraphNameOnServer(request, params)
        const body = await request.json()
        const newSpaceId = await createSpace(
            graphName,
            body.spaceText,
            body.spaceBuildMethod,
            body.halfAxisIdsAndDirections
        ) as number
        
        return new Response(JSON.stringify(newSpaceId))

    } catch(err) {
        throw error(500, `A server error occurred while attempting to create Space: ${err}`)
    }
}