import type { AppConfig, GraphConfig, GraphConstruct } from "$lib/shared/constants"
import type { LatestConstructInfos } from "$lib/db/serverSide/getInfo"
import type { DirectionDbModel, SpaceDbModel, ThingDbModel, ThingSearchListItemDbModel } from "$lib/models/dbModels"
import { Direction, Space, Thing, ThingSearchListItem } from "$lib/models/graphModels"



/*
 * Retrieve Graph constructs from the database.
 */
export async function graphConstructs<Type extends GraphConstruct>(
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
            const queriedInstances = await res.json() as DirectionDbModel[]
            const directions: Direction[] = []
            for (const model of queriedInstances) {
                directions.push( new Direction(model) )
            }
            return directions as Type[]
        } else if (constructName === "Space") {
            const queriedInstances = await res.json() as SpaceDbModel[]
            const spaces: Space[] = []
            for (const model of queriedInstances) {
                spaces.push( new Space(model) )
            }
            return spaces as Type[]
        } else {
            const queriedInstances = await res.json() as ThingDbModel[]
            const things: Thing[] = []
            for (const model of queriedInstances) {
                things.push( new Thing(model) )
            }
            return things as Type[]
        }
    // Handle errors if needed.
    } else {
        res.text().then(text => {throw Error(text)})
        return []
    }
}

/*
 * Retrieve Things from the database by GUID.
 */
export async function thingsByGuid( guids: string[] ): Promise<Thing[]> {
    const res = await fetch(`api/db/graphConstructs/things-by-guid-${guids.join(",")}`)

    // If the response is ok,
    if (res.ok) {
        // Unpack the response JSON as an array of instances.
        const queriedInstances = await res.json() as ThingDbModel[]
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





/*
 * Get the Unigraph folder.
 */
export async function getUnigraphFolder(): Promise<string | false> {
    const res = await fetch(`api/file/unigraphFolder`)

    // If the response is ok,
    if (res.ok) {
        const unigraphFolder = await res.text()
        return unigraphFolder

    // Handle errors if needed.
    } else {
        res.text().then(text => {throw Error(text)})
        return false
    }
}




/*
 * Get the app configuration.
 */
export async function getAppConfig(): Promise<AppConfig | false> {
    const res = await fetch("/api/file/appConfig")

    // If the response is ok,
    if (res.ok) {
        const appConfig = await res.json() as AppConfig
        return appConfig

    // Handle errors if needed.
    } else {
        res.text().then(text => {throw Error(text)})
        return false
    }
}

/*
 * Get the app configuration.
 */
export async function getGraphConfig(): Promise<GraphConfig | false> {
    const res = await fetch("/api/file/graphConfig")

    // If the response is ok,
    if (res.ok) {
        const graphConfig = await res.json() as GraphConfig
        return graphConfig

    // Handle errors if needed.
    } else {
        res.text().then(text => {throw Error(text)})
        return false
    }
}