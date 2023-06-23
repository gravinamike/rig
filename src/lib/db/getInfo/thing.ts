// Import types.
import type { RawThingDbModel } from "$lib/server/models"
import type { ThingSearchListItemDbModel } from "$lib/models/dbModels"

// Import session-specific fetch.
import { sessionSpecificFetch as fetch } from "$lib/db/sessionSpecificFetch"

// Import models.
import { Thing, ThingSearchListItem } from "$lib/models/constructModels"


/**
 * Get-Thing-by-GUID method.
 * 
 * Retrieve Things from the back-end database by GUID.
 * @param guids - The GUIDs of the Things to retrieve.
 * @returns - An array of Things for those GUIDs.
 */
export async function getThingsByGuid( guids: string[] ): Promise<Thing[]> {
    // Query the Things-by-GUID API.
    const res = await fetch(`api/db/graphConstructs/things-by-guid-${guids.join(",")}`)

    // If the response is ok,
    if (res.ok) {
        // Parse the response as an array of raw Thing DB models.
        const queriedInstances = await res.json() as RawThingDbModel[]

        // Create a corresponding array of Things.
        const things: Thing[] = []
        for (const model of queriedInstances) {
            things.push( new Thing(model) )
        }

        // Return that array.
        return things

    // Handle errors if needed.
    } else {
        res.text().then(text => {throw Error(text)})
        return []
    }
}

/**
 * Get-Thing-search-list-items method.
 * 
 * Retrieve an array of Thing search list items from the back-end database.
 * @param thingIds - The IDs of the Things.
 * @returns - An array of Thing search list items for those IDs.
 */
export async function getThingSearchListItems(thingIds?: number[]): Promise<ThingSearchListItem[] | false> {
    const res = thingIds ===
        // If no IDs were specified, query the Thing-searchlist-item API for all items.
        undefined ? await fetch(`api/db/graphConstructs/thingSearchListItems-all`) :
        // Otherwise, query only for the specified Thing IDs.
        await fetch(`api/db/graphConstructs/thingSearchListItems-${thingIds}`)

    // If the response is ok,
    if (res.ok) {
        // Parse the response as an array of Thing search list item DB models.
        const models = await res.json() as ThingSearchListItemDbModel[]

        // Create a corresponding array of Thing search list items.
        const thingSearchList: ThingSearchListItem[] = []
        for (const model of models) {
            thingSearchList.push( new ThingSearchListItem(model) )
        }

        // Return that array.
        return thingSearchList

    // Handle errors if needed.
    } else {
        res.text().then(text => {throw Error(text)})
        return false
    }
}