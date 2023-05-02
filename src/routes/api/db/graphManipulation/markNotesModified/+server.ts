import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import { markNotesModified } from "$lib/server/db"


export const POST: RequestHandler = async ({ request }) => {
    try {
        const body = await request.json()
        await markNotesModified(body.noteIdsToMarkModified)
        
        return new Response(JSON.stringify(
            {
                message: "Note(s) marked as modified."
            }
        ))

    } catch(err) {
        throw error(500, `A server error occurred while attempting to mark Note(s) as modified: ${err}`)
    }
}