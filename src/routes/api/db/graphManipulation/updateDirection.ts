import { updateDirection } from "$lib/db/serverSide"


export async function post(
    {request}: {request: Request}
): Promise<{status: number, body: string | {error: string}}> {
    try {
        const body = await request.json()
        await updateDirection(
            body.directionId,
            body.directionText,
            body.nameForObjects,
            body.oppositeId
        )
        
        return {
            status: 200,
            body: "Thing text updated successfully."
        }

    } catch(err) {
        return {
            status: 500,
            body: { error: `A server error occurred while attempting to update Direction: ${err}`}
        }
    }
}