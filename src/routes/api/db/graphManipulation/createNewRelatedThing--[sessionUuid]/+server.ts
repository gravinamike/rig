import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import type { Thing } from "$lib/models/constructModels"
import { createNewRelatedThing } from "$lib/server/db"
import { getGraphNameOnServer } from "$lib/server/db/utility"


export const POST: RequestHandler = async ({ request, params }) => {
    try {
        const graphName = getGraphNameOnServer(request, params)
        const body = await request.json()
        const newRelatedThing = await createNewRelatedThing(
            graphName,
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