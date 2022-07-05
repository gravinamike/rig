import type { ThingDbModel } from "$lib/models/dbModels"
import { queryThingsByGuid } from "$lib/db/serverSide"


export async function get(
    { params }: { params: { thingGuids: string } }
): Promise<{
    status: number;
    body: ThingDbModel[] | { error: string }
}> {
    let thingGuids: string | string[]

    try {
        ({ thingGuids } = params)
        const things = await queryThingsByGuid(thingGuids.split(","))
        return {
            status: 200,
            body: things
        }

    } catch(err) {
        return {
            status: 500,
            body: { error: `A server error occurred while attempting to get Things: ${err}`}
        }
    }
}