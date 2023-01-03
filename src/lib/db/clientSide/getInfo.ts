import type { AppConfig, GraphConfig } from "$lib/shared/constants"
import type { LatestConstructInfos } from "$lib/db/serverSide/getInfo"
import type { RawThingDbModel } from "$lib/models/dbModels/serverSide"
import { Thing, ThingSearchListItem } from "$lib/models/constructModels"
import type { GraphDbModel, ThingSearchListItemDbModel } from "$lib/models/dbModels/clientSide"



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
        const graphConfig = await res.json()

        // If the config is from an older version that doesn't contain certain
        // keys, add these keys.
        if (!("leftSideMenu" in graphConfig)) graphConfig["leftSideMenu"] = null
        if (!("rightSideMenu" in graphConfig)) graphConfig["rightSideMenu"] = null
        if (!("notesEditorLocked" in graphConfig)) graphConfig["notesEditorLocked"] = null

        return graphConfig as GraphConfig

    // Handle errors if needed.
    } else {
        res.text().then(text => {throw Error(text)})
        return false
    }
}


/*
 * Get list of font names.
 */
export async function getFontNames(): Promise<string[] | false> {
    const res = await fetch("/api/file/fontNames")

    // If the response is ok,
    if (res.ok) {
        const fontNames = await res.json() as string[]
        return fontNames

    // Handle errors if needed.
    } else {
        res.text().then(text => {throw Error(text)})
        return false
    }
}