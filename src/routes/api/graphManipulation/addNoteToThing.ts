import { addNoteToThing } from "$lib/db/serverSide"


export async function post(
    { body }: { body: string }
): Promise<{status: number, body: string | {error: string}}> {
    try {
        const parsedBody = JSON.parse(body)
        await addNoteToThing(parsedBody.thingId)
        
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