import { updateThingDefaultSpace } from "$lib/db/serverSide"


export async function post(
    {request}: {request: Request}
): Promise<{status: number, body: string | {error: string}}> {
    try {
        const body = await request.json()
        await updateThingDefaultSpace(body.thingId, body.spaceId)
        
        return {
            status: 200,
            body: "Note updated successfully."
        }

    } catch(err) {
        return {
            status: 500,
            body: { error: `A server error occurred while attempting to update Thing's default Space: ${err}`}
        }
    }
}