import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import { updateNote } from "$lib/db/serverSide"


export const POST: RequestHandler = async ({ request }) => {
    try {
        const body = await request.json()
        await updateNote(body.noteId, body.text)
        
        return new Response(JSON.stringify(
            {
                message: "Note updated successfully."
            }
        ))

    } catch(err) {
        throw error(500, `A server error occurred while attempting to update Note: ${err}`)
    }
}