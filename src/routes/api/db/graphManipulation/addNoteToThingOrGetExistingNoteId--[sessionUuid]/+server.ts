import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import { addNoteToThingOrGetExistingNoteId } from "$lib/server/db"
import { getGraphNameOnServer } from "$lib/server/db/utility"


export const POST: RequestHandler = async ({ request, params }) => {
    try {
        const graphName = getGraphNameOnServer(request, params)
        const body = await request.json()
        const newNoteId = await addNoteToThingOrGetExistingNoteId(
            graphName,
            body.thingId
        )
        
        return new Response(JSON.stringify(newNoteId))

    } catch(err) {
        throw error(500, `A server error occurred while attempting to add new Note to Thing: ${err}`)
    }
}