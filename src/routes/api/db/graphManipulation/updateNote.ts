import { updateNote } from "$lib/db/serverSide"


export async function post(
    {request}: {request: Request}
): Promise<{status: number, body: string | {error: string}}> {
    try {
        const body = await request.json()
        await updateNote(body.noteId, body.text)
        
        return {
            status: 200,
            body: "Note updated successfully."
        }

    } catch(err) {
        return {
            status: 500,
            body: { error: `A server error occurred while attempting to update Note: ${err}`}
        }
    }
}