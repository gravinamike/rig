import type { EndpointOutput } from "@sveltejs/kit"
import { createNewRelatedThing } from "$lib/db/serverSide"


export async function post(
    { body }: { body: string }
): Promise<EndpointOutput> {
    try {
        const parsedBody = JSON.parse(body)
        await createNewRelatedThing(parsedBody.thingIdToRelateFrom, parsedBody.directionId, parsedBody.text)
        
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