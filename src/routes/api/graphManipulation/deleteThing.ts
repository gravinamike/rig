import type { EndpointOutput } from "@sveltejs/kit"
import { deleteThing } from "$lib/db/query"


export async function post(
    { body }: { body: string }
): Promise<EndpointOutput> {
    try {
        const parsedBody = JSON.parse(body)
        await deleteThing(parsedBody.thingIdToDelete)
        
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