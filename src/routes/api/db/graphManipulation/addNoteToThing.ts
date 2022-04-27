import { addNoteToThing } from "$lib/db/serverSide"


export async function post(
    {request}: {request: Request}
): Promise<{status: number, body: string | {error: string}}> {
    try {
        const body = await request.json()
        await addNoteToThing(body.thingId)
        
        return {
            status: 200,
            body: "New Note added to Thing successfully."
        }

    } catch(err) {
        return {
            status: 500,
            body: { error: `A server error occurred while attempting to add new Note to Thing: ${err}`}
        }
    }
}