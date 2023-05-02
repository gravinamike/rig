import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import type { Thing } from "$lib/models/constructModels"
import { createNewRelatedThing } from "$lib/server/db"


export const POST: RequestHandler = async ({ request }) => {
    try {
        const body = await request.json()
        const newRelatedThing = await createNewRelatedThing(
            body.thingIdToRelateFrom,
            body.directionId,
            body.text,
            body.defaultSpace
        ) as Thing
        
        return new Response(JSON.stringify(newRelatedThing))

    } catch(err) {
        throw error(500, `A server error occurred while attempting to create new related Thing: ${err}`)
    }
}