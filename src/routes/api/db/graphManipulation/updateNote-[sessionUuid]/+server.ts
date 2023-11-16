import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import { updateNote } from "$lib/server/db"


export const POST: RequestHandler = async ({ request }) => {
    const body = await request.json()
    const updateNoteResult = await updateNote(body.noteId, body.text)

    if (updateNoteResult === true) {
        return new Response(JSON.stringify(
            {
                message: "Note updated successfully."
            }
        ))
    }

    throw error(500, `A server error occurred while attempting to update Note: ${updateNoteResult}`)
}