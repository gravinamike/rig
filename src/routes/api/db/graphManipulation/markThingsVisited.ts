import { markThingsVisited } from "$lib/db/serverSide"


export async function post(
    {request}: {request: Request}
): Promise<{status: number, body: string | {error: string}}> {
    try {
        const body = await request.json()
        await markThingsVisited(body.thingIdsToMarkVisited)
        
        return {
            status: 200,
            body: "Thing(s) marked as visited."
        }

    } catch(err) {
        return {
            status: 500,
            body: { error: `A server error occurred while attempting to mark Thing(s) as visited: ${err}`}
        }
    }
}