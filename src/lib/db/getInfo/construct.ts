// Import types.
import type { GraphConstructDbModel } from "$lib/models/dbModels"
import type { LatestGraphConstructInfos } from "$lib/server/db/getInfo"

// Import session-specific fetch.
import { sessionSpecificFetch as fetch } from "$lib/db/sessionSpecificFetch"


/**
 * Get-Graph-construct-database-models method.
 * 
 * Retrieves an array of Graph models (such as Direction, Space, and Thing
 * models) from the back-end database by Graph construct type and ID.
 * @param constructName - The name of the general construct type to retrieve.
 * @param ids - The IDs of the specific constructs to receive.
 * @returns - An array of Graph construct models.
 */
export async function getGraphConstructDbModels<Type extends GraphConstructDbModel>(
    constructName: "Direction" | "Space" | "Thing",
    ids?: number[]
): Promise<Type[]> {
    const res =
        // If no IDs were provided, fetch all instances of this construct.
        typeof ids === "undefined" ? await fetch(`api/db/graphConstructs/${ constructName.toLowerCase() }s-all`) :
        
        // Else, if IDs *were* provided, fetch only those instances that match the IDs.
        await fetch(`api/db/graphConstructs/${ constructName.toLowerCase() }s-${ids.join(",")}`)

    // If the response is ok, parse and return the array of Graph construct models.
    if (res.ok) {
        const queriedInstances = await res.json() as Type[]
        return queriedInstances

    // Handle errors if needed.
    } else {
        res.text().then(text => {throw Error(text)})
        return []
    }
}

/**
 * Get-latest-Graph-construct-infos method.
 * 
 * Retrieves an array of information objects about the latest Graph constructs
 * to be created.
 */
export async function getLatestGraphConstructInfos(): Promise<LatestGraphConstructInfos | false> {
    // Query the latest-Graph-constructs API.
    const res = await fetch(`api/db/graphConstructs/latestConstructs`)

    // If the response is ok, parse and return the latest Graph construct info
    // objects.
    if (res.ok) {
        const latestDbConstructs = await res.json() as LatestGraphConstructInfos
        return latestDbConstructs

    // Handle errors if needed.
    } else {
        res.text().then(text => {throw Error(text)})
        return false
    }
}