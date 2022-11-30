import { updateSpace } from "$lib/db/serverSide"


export async function post(
    {request}: {request: Request}
): Promise<{status: number, body: string | {error: string}}> {
    try {
        const body = await request.json()
        await updateSpace(
            body.spaceId,
            body.spaceText,
            body.directions
        )
        
        return {
            status: 200,
            body: "Space updated successfully."
        }

    } catch(err) {
        return {
            status: 500,
            body: { error: `A server error occurred while attempting to update Space: ${err}`}
        }
    }
}