import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import { createDirection } from "$lib/server/db"


export const POST: RequestHandler = async ({request}) => {
    try {
        const body = await request.json()
        const newSpaceId = await createDirection(
            body.directionText,
            body.objectText,
            body.oppositeDirectionId
        ) as number
        
        return new Response(JSON.stringify(newSpaceId))

    } catch(err) {
        throw error(500, `A server error occurred while attempting to create Direction: ${err}`)
    }
}