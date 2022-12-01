import { updateThingPerspectiveText } from "$lib/db/serverSide"


export async function post(
    {request}: {request: Request}
): Promise<{status: number, body: string | {error: string}}> {
    try {
        const body = await request.json()
        await updateThingPerspectiveText(body.pThingId, body.thingId, body.text)
        
        return {
            status: 200,
            body: "Thing Perspective text updated successfully."
        }

    } catch(err) {
        return {
            status: 500,
            body: { error: `A server error occurred while attempting to update Thing Perspective text: ${err}`}
        }
    }
}