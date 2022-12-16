import { reorderDirection } from "$lib/db/serverSide"


export async function post(
    {request}: {request: Request}
): Promise<{status: number, body: string | {error: string}}> {
    
    try {
        const body = await request.json()
        await reorderDirection(
            body.directionId,
            body.newIndex
        )

        return {
            status: 200,
            body: "Direction reordered successfully."
        }

    } catch(err) {
        return {
            status: 500,
            body: { error: `A server error occurred while attempting to reorder Direction: ${err}`}
        }
    }
}