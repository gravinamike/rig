import type { ThingSearchListItem } from "$lib/models/dbModels"
import { queryThingSearchList } from "$lib/db/serverSide"


export async function get(): Promise<{
    status: number;
    body: ThingSearchListItem[] | { error: string }
}> {
    try {
        const thingSearchList = await queryThingSearchList()
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