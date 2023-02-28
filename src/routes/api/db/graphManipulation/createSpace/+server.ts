import type { RequestHandler } from "@sveltejs/kit"
import type { Space } from "$lib/models/constructModels"
import { error } from "@sveltejs/kit"
import { createSpace } from "$lib/db/serverSide"


export const POST: RequestHandler = async ({request}) => {
    try {
        const body = await request.json()
        const newSpace = await createSpace(
            body.spaceText,
            body.halfAxisIdsAndDirections
        ) as Space
        
        return new Response(JSON.stringify(newSpace))

    } catch(err) {
        throw error(500, `A server error occurred while attempting to create Space: ${err}`)
    }
}