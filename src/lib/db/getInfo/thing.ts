// Import types.
import type { RawThingDbModel } from "$lib/server/models"
import type { ThingSearchListItemDbModel } from "$lib/models/dbModels"

// Import session-specific fetch.
import { sessionSpecificFetch as fetch } from "$lib/db/sessionSpecificFetch"

// Import models.
import { Thing, ThingSearchListItem } from "$lib/models/constructModels"




/*
 * Retrieve Things from the database by GUID.
 */
export async function thingsByGuid( guids: string[] ): Promise<Thing[]> {
    const res = await fetch(`api/db/graphConstructs/things-by-guid-${guids.join(",")}`)

    // If the response is ok,
    if (res.ok) {
        // Unpack the response JSON as an array of instances.
        const queriedInstances = await res.json() as RawThingDbModel[]
        const things: Thing[] = []
        for (const model of queriedInstances) {
            things.push( new Thing(model) )
        }
        return things
    // Handle errors if needed.
    } else {
        res.text().then(text => {throw Error(text)})
        return []
    }
}








/*
 * Get a search list of Things.
 */
export async function thingSearchListItems(thingIds?: number[]): Promise<ThingSearchListItem[] | false> {
    const res = thingIds === undefined ?
        await fetch(`api/db/graphConstructs/thingSearchListItems-all`) :
        await fetch(`api/db/graphConstructs/thingSearchListItems-${thingIds}`)

    if (res.ok) {
        const models = await res.json() as ThingSearchListItemDbModel[]
        const thingSearchList: ThingSearchListItem[] = []
        for (const model of models) {
            thingSearchList.push( new ThingSearchListItem(model) )
        }
        return thingSearchList
    } else {
        res.text().then(text => {throw Error(text)})
        return false
    }
}