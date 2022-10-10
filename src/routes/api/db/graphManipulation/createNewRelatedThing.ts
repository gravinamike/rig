import type { Thing } from "$lib/models/constructModels"
import { createNewRelatedThing } from "$lib/db/serverSide"


export async function post(
    {request}: {request: Request}
): Promise<{status: number, body: Thing | {error: string}}> {
    try {
        const body = await request.json()
        const newRelatedThing = await createNewRelatedThing(
            body.thingIdToRelateFrom,
            body.directionId,
            body.text
        ) as Thing
        
        return {
            status: 200,
            body: newRelatedThing
        }

    } catch(err) {
        return {
            status: 500,
            body: { error: `A server error occurred while attempting to create new related Thing: ${err}`}
        }
    }
}