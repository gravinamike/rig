import { deleteRelationship } from "$lib/db/serverSide"


export async function post(
    {request}: {request: Request}
): Promise<{status: number, body: string | {error: string}}> {
    try {
        const body = await request.json()
        await deleteRelationship(body.sourceThingId, body.destThingId)
        
        return {
            status: 200,
            body: "Relationship deleted successfully."
        }

    } catch(err) {
        return {
            status: 500,
            body: { error: `A server error occurred while attempting to delete Relationship: ${err}`}
        }
    }
}