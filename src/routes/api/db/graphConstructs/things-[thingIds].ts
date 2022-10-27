import { stripThingDbModels } from "$lib/models/dbModels/serverSide"
import { queryThings } from "$lib/db/serverSide"
import type { ThingDbModel } from "$lib/models/dbModels/clientSide"


export async function get(
    { params }: { params: { thingIds: string } }
): Promise<{
    status: number;
    body: ThingDbModel[] | { error: string }
}> {
    let thingIds: string | number[]

    try {
        ({ thingIds } = params)
        const rawThings = await queryThings(thingIds.split(",").map(x => Number(x)))

        const things = stripThingDbModels(rawThings)

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