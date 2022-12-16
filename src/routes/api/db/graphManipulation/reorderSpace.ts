import { reorderSpace } from "$lib/db/serverSide"


export async function post(
    {request}: {request: Request}
): Promise<{status: number, body: string | {error: string}}> {
    
    try {
        const body = await request.json()
        await reorderSpace(
            body.spaceId,
            body.newIndex
        )

        return {
            status: 200,
            body: "Space reordered successfully."
        }

    } catch(err) {
        return {
            status: 500,
            body: { error: `A server error occurred while attempting to reorder Space: ${err}`}
        }
    }
}