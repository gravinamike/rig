import { createNewRelatedThing } from "$lib/db/serverSide"


export async function post(
    {request}: {request: Request}
): Promise<{status: number, body: string | {error: string}}> {
    try {
        const body = await request.json()
        await createNewRelatedThing(body.thingIdToRelateFrom, body.directionId, body.text)
        
        return {
            status: 200,
            body: "New related Thing created successfully."
        }

    } catch(err) {
        return {
            status: 500,
            body: { error: `A server error occurred while attempting to create new related Thing: ${err}`}
        }
    }
}