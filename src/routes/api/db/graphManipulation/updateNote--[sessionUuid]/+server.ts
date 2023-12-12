import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import { updateNote } from "$lib/server/db"
import { getGraphNameOnServer } from "$lib/server/db/utility"


export const POST: RequestHandler = async ({ request, params }) => {
    const graphName = getGraphNameOnServer(request, params)
    const body = await request.json()
    const updateNoteResult = await updateNote(
        graphName,
        body.noteId,
        body.text
    )

    if (updateNoteResult === true) {
        return new Response(JSON.stringify(
            {
                message: "Note updated successfully."
            }
        ))
    }

    throw error(500, `A server error occurred while attempting to update Note: ${updateNoteResult}`)
}