import type { ThingSearchListItem } from "$lib/models/dbModels"


/*
 * Get a search list of Things.
 */
export async function thingSearchList(): Promise<ThingSearchListItem[] | false> {
    const res = await fetch(`api/db/graphConstructs/thingSearchList`)

    if (res.ok) {
        const thingSearchList = await res.json() as ThingSearchListItem[]
        return thingSearchList
    } else {
        res.text().then(text => {throw Error(text)})
        return false
    }
}