import type { ThingSearchListItem } from "$lib/models/graphModels"
import { queryThingSearchList } from "$lib/db/serverSide"

export async function get(
    { params }: { params: { thingIds: string } }
): Promise<{
    status: number;
    body: ThingSearchListItem[] | { error: string }
}> {
    let thingIds: string | number[]

    try {
        ({ thingIds } = params)
        const thingSearchList = thingIds === "all" ?
            await queryThingSearchList(null) :
            await queryThingSearchList(thingIds.split(",").map(x => Number(x)))
            
        return {
            status: 200,
            body: thingSearchList
        }

    } catch(err) {
        return {
            status: 500,
            body: { error: `A server error occurred while attempting to get Thing search list: ${err}`}
        }
    }
}