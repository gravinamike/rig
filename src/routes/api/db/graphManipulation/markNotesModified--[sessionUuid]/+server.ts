import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import { markNotesModified } from "$lib/server/db"
import { getGraphNameOnServer } from "$lib/server/db/utility"


export const POST: RequestHandler = async ({ request, params }) => {
    try {
        const graphName = getGraphNameOnServer(request, params)
        const body = await request.json()
        await markNotesModified(
            graphName,
            body.noteIdsToMarkModified
        )
        
        return new Response(JSON.stringify(
            {
                message: "Note(s) marked as modified."
            }
        ))

    } catch(err) {
        throw error(500, `A server error occurred while attempting to mark Note(s) as modified: ${err}`)
    }
}