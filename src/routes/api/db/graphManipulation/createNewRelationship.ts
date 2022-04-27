import { createNewRelationship } from "$lib/db/serverSide"


export async function post(
    {request}: {request: Request}
): Promise<{status: number, body: string | {error: string}}> {
    try {
        const body = await request.json()
        await createNewRelationship(body.sourceThingId, body.destThingId, body.directionId)
        
        return {
            status: 200,
            body: "New Relationship created successfully."
        }

    } catch(err) {
        return {
            status: 500,
            body: { error: `A server error occurred while attempting to create new Relationship: ${err}`}
        }
    }
}