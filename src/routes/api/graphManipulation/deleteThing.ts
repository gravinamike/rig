import { deleteThing } from "$lib/db/serverSide"


export async function post(
    {request}: {request: Request}
): Promise<{status: number, body: string | {error: string}}> {
    try {
        const body = await request.json()
        await deleteThing(body.thingIdToDelete)
        
        return {
            status: 200,
            body: "Thing deleted successfully."
        }

    } catch(err) {
        return {
            status: 500,
            body: { error: `A server error occurred while attempting to delete Thing: ${err}`}
        }
    }
}