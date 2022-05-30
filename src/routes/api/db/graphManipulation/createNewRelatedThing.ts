import type { ThingDbModel } from "$lib/models/dbModels"
import { createNewRelatedThing } from "$lib/db/serverSide"


export async function post(
    {request}: {request: Request}
): Promise<{status: number, body: ThingDbModel | {error: string}}> {
    try {
        const body = await request.json()
        const newRelatedThingDbModel = await createNewRelatedThing(
            body.thingIdToRelateFrom,
            body.directionId,
            body.text
        ) as ThingDbModel
        
        return {
            status: 200,
            body: newRelatedThingDbModel
        }

    } catch(err) {
        return {
            status: 500,
            body: { error: `A server error occurred while attempting to create new related Thing: ${err}`}
        }
    }
}