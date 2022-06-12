import { markNotesModified } from "$lib/db/serverSide"


export async function post(
    {request}: {request: Request}
): Promise<{status: number, body: string | {error: string}}> {
    try {
        const body = await request.json()
        await markNotesModified(body.noteIdsToMarkModified)
        
        return {
            status: 200,
            body: "Note(s) marked as modified."
        }

    } catch(err) {
        return {
            status: 500,
            body: { error: `A server error occurred while attempting to mark Note(s) as modified: ${err}`}
        }
    }
}