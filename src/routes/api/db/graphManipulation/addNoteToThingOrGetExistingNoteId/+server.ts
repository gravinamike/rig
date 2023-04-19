import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import { addNoteToThingOrGetExistingNoteId } from "$lib/db/serverSide"


export const POST: RequestHandler = async ({ request }) => {
    try {
        const body = await request.json()
        const newNoteId = await addNoteToThingOrGetExistingNoteId(body.thingId)
        
        return new Response(JSON.stringify(newNoteId))

    } catch(err) {
        throw error(500, `A server error occurred while attempting to add new Note to Thing: ${err}`)
    }
}