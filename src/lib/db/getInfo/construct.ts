// Import types.
import type { GraphDbModel } from "$lib/models/dbModels"
import type { LatestConstructInfos } from "$lib/server/db/getInfo"

// Import session-specific fetch.
import { sessionSpecificFetch as fetch } from "$lib/db/sessionSpecificFetch"


/*
 * Retrieve Graph DB models from the database.
 */
export async function graphDbModels<Type extends GraphDbModel>(
    constructName: "Direction" | "Space" | "Thing",
    ids?: number[]
): Promise<Type[]> {
    let res: Response
    
    // If no IDs were provided, fetch all instances of this construct.
    if (typeof ids === "undefined") {
        res = await fetch(`api/db/graphConstructs/${ constructName.toLowerCase() }s-all`)

    // Else, if IDs *were* provided,
    } else {
        res = await fetch(`api/db/graphConstructs/${ constructName.toLowerCase() }s-${ids.join(",")}`)
    }

    // If the response is ok,
    if (res.ok) {
        
        if (constructName === "Direction") {
            const queriedInstances = await res.json() as Type[]
            return queriedInstances
        } else if (constructName === "Space") {
            const queriedInstances = await res.json() as Type[]
            return queriedInstances
        } else {
            const queriedInstances = await res.json() as Type[]
            return queriedInstances
        }
    // Handle errors if needed.
    } else {
        res.text().then(text => {throw Error(text)})
        return []
    }
}

/*
 * Get a information about the latest constructs added to the database.
 */
export async function latestDbConstructs(): Promise<LatestConstructInfos | false> {
    const res = await fetch(`api/db/graphConstructs/latestConstructs`)

    // If the response is ok,
    if (res.ok) {
        const latestDbConstructs = await res.json() as LatestConstructInfos
        return latestDbConstructs

    // Handle errors if needed.
    } else {
        res.text().then(text => {throw Error(text)})
        return false
    }
}