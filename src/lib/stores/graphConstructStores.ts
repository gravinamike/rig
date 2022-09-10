import type { Writable } from "svelte/store"
import type { GraphConstruct } from "$lib/shared/constants"

import { writable, derived } from "svelte/store"
import { maxThingsToStore } from "$lib/shared/constants"
import { Direction, Space, isDirection, isSpace, Thing, isThing } from "$lib/models/constructModels"
import { graphConstructs } from "$lib/db/clientSide"



/* Direction-related stores and subscriptions. */

export const directionsStore = writable( {} as { [id: number]: Direction } )

let directionsStoreValue: { [id: number]: Direction }
directionsStore.subscribe(value => {directionsStoreValue = value})

export const directionsStoreAsArray = derived(
    directionsStore,
    $directionsStore => Object.values($directionsStore)
)

export const directionIdsNotFoundStore = writable( [] as number[] )


/* Space-related stores and subscriptions. */

export const spacesStore = writable( {} as { [id: number]: Space } )
let spacesStoreValue: { [id: number]: Space }
spacesStore.subscribe(value => {spacesStoreValue = value})

export const spacesStoreAsArray = derived( spacesStore, $spacesStore => Object.values($spacesStore) )

export const spaceIdsNotFoundStore = writable( [] as number[] );


/* Thing-related stores and subscriptions. */

export const thingsStore = writable( {} as { [id: number]: Thing } )

let thingsStoreValue: { [id: number]: Thing }
thingsStore.subscribe(value => {thingsStoreValue = value})

export const thingsStoreAsArray = derived( thingsStore, $thingsStore => Object.values($thingsStore) )

export const thingIdsNotFoundStore = writable( [] as number[] )


/**
 * Add Graph constructs to the stores.
 * @param  {Type} constructs - The Graph constructs to add to the store.
 */
function updateConstructStore<Type extends GraphConstruct>( constructs: Type | Type[] ): void {
    // If necessary, pack a single supplied construct in an array for processing.
    if (!("length" in constructs)) constructs = [constructs]
    
    // Determine which store to update based on construct type.
    let store: Writable<{ [id: number]: GraphConstruct }>
    if ( constructs.length && isDirection(constructs[0]) ) {
        store = directionsStore
    } else if ( constructs.length && isSpace(constructs[0]) ) {
        store = spacesStore
    } else if ( constructs.length && isThing(constructs[0]) ) {
        store = thingsStore
    } else {
        return
    }

    // Update the store with each supplied construct.
    constructs.forEach((construct) => {
        store.update( (current) => { current[construct.id as number] = construct; return current } )
    })
}


/**
 * Add Graph construct IDs to the stores.
 * @param  {"Direction" | "Space" | "Thing"} constructName - The name of the construct type.
 * @param  {number | number[]} ids - The construct IDs to add to the stores.
 */
function updateIdStore(
    constructName: "Direction" | "Space" | "Thing" | "ThingNotFound",
    ids: number | number[]
): void {
    // If necessary, pack a single supplied id in an array for processing.
    if (typeof ids === "number") ids = [ids]

    // Determine which store to update based on construct name.
    let store: Writable<number[]>
    if (constructName === "Direction") {
        store = directionIdsNotFoundStore
    } else if (constructName === "Space") {
        store = spaceIdsNotFoundStore
    } else if (constructName === "Thing") {
        store = thingIdsNotFoundStore
    }

    // Update the store with each supplied ID.
    ids.forEach((id) => {
        store.update( (current) => { if (!current.includes(id)) current.push(id); return current } )
    })
}


/**
 * Trim Thing store down to their maximum allowed size.
 */
function trimThingStore(): void {
    thingsStore.update( (current) => {
        const thingsStoreAsArray = Object.values(current)
        const thingIdsInOrderInstantiated = thingsStoreAsArray
            .sort((a, b) => b.whenModelInstantiated.getTime() - a.whenModelInstantiated.getTime())
            .map(thing => thing.id)
        
        const trimmedThingIds = thingIdsInOrderInstantiated.slice(0, maxThingsToStore)

        const filteredThingsStore = Object.fromEntries(
            Object.entries(current).filter(
               (keyVal) => trimmedThingIds.map(id => Number(id)).includes(Number(keyVal[0]))
            )
        )

        return filteredThingsStore
    } )
}


/**
 * Check whether a Graph construct is in the store (by ID).
 * @param  {"Direction" | "Space" | "Thing"} constructName - The name of the construct type.
 * @param  {number | number[]} id - The construct IDs to check.
 */
export function graphConstructInStore(
    constructName: "Direction" | "Space" | "Thing",
    id: number
): boolean {
    // Determine which store to check based on construct name.
    const storeValue = {
        "Direction": directionsStoreValue,
        "Space": spacesStoreValue,
        "Thing": thingsStoreValue
    }[constructName]

    // Determine if the construct ID is in the store.
    return id in storeValue ? true : false
}


/**
 * Fetch Graph constructs from the API, then add them to the stores.
 * @param  {"Direction" | "Space" | "Thing"} constructName - The name of the construct type.
 * @param  {number | number[]} ids - The construct IDs to fetch and store.
 * @param  allowUpdating - Whether to update or skip constructs that are already in the store.
 */
export async function storeGraphConstructs<Type extends GraphConstruct>(
    constructName: "Direction" | "Space" | "Thing",
    ids?: number | number[],
    allowUpdating = false
): Promise< Type[] > {
    // Determine which store to check based on construct name.
    const storeValue = {
        "Direction": directionsStoreValue,
        "Space": spacesStoreValue,
        "Thing": thingsStoreValue
    }[constructName]

    let idsToQuery: number[] = []
    let queriedInstances: Type[]
    
    // If no IDs were provided, fetch all instances of this construct.
    if (typeof ids === "undefined") {
        queriedInstances = await graphConstructs(constructName) as Type[]

    // Else, if IDs *were* provided, fetch instances based on the IDs.
    } else {
        // Convert single IDs into arrays for processing (if needed).
        if ( typeof ids === "number" ) ids = [ids]

        // Get array of IDs to query.
        if (allowUpdating) {
            // If updating is allowed, use the full array of supplied IDs.
            idsToQuery = ids
        } else {
            // If updating is not allowed, filter any IDs that are already stored out of the supplied array.
            const idsNotToQuery = Object.keys(storeValue).map(x => Number(x))
            idsToQuery = ids.filter( x => !idsNotToQuery.includes(x) )
        }

        // Fetch the instances from the API.
        if (!idsToQuery.length) return []
        queriedInstances = await graphConstructs(constructName, idsToQuery) as Type[]
    }

    // Update the store with these instances.
    updateConstructStore(queriedInstances)
    // Update the IDs Not Found store with any IDs that weren't fetched.
    if (!(typeof ids === "undefined")) {
        const idsFound = queriedInstances.map(x => x.id) as number[]
        const idsNotFound = idsToQuery.filter( x => !idsFound.includes(x) )
        updateIdStore(constructName, idsNotFound)
    }

    // If the construct is "Thing", trim the store to the maximum allowed size.
    if (constructName === "Thing") trimThingStore()

    // Return the array of constructs.
    return queriedInstances
}


/**
 * Remove Graph constructs from the stores.
 * @param  {"Direction" | "Space" | "Thing"} constructName - The name of the construct type.
 * @param  {number | number[]} ids - The IDs of the constructs to remove from the store.
 */
export async function unstoreGraphConstructs(
    constructName: "Direction" | "Space" | "Thing",
    ids: number | number[]
): Promise<void> {
    // Determine which store to update based on construct name.
    const store: Writable<{[id: number]: GraphConstruct}> = {
        "Direction": directionsStore,
        "Space": spacesStore,
        "Thing": thingsStore
    }[constructName]

    // Convert single IDs into arrays for processing (if needed).
    if ( typeof ids === "number" ) ids = [ids]

    // Update the store with each supplied id.
    ids.forEach((id) => {
        store.update( (current) => { delete current[id]; return current } )
    })
}


/**
 * Clear a Graph construct Store.
 * @param  {"Direction" | "Space" | "Thing"} constructName - The name of the construct type.
 */
export async function clearGraphConstructs(constructName: "Direction" | "Space" | "Thing"): Promise<void> {
    // Determine which store to clear based on construct name.
    const store: Writable<{[id: number]: GraphConstruct}> = {
        "Direction": directionsStore,
        "Space": spacesStore,
        "Thing": thingsStore
    }[constructName]

    // Clear the store.
    store.set({})
}


/**
 * Retrieve Graph constructs from the stores.
 * @param  {"Direction" | "Space" | "Thing"} constructName - The name of the construct type.
 * @param  {number | number[]} ids - The IDs of the constructs to retrieve from the stores.
 */
export function retrieveGraphConstructs<Type extends GraphConstruct>(
    constructName: "Direction" | "Space" | "Thing",
    ids: number
): Type | null
export function retrieveGraphConstructs<Type extends GraphConstruct>(
    constructName: "Direction" | "Space" | "Thing",
    ids: number[]
): Type[]
export function retrieveGraphConstructs<Type extends GraphConstruct>(
    constructName: "Direction" | "Space" | "Thing",
    ids: number | number[]
): Type[] | Type | null {
    // Determine which store to get construct from based on construct name.
    let storeValue: { [id: number]: GraphConstruct }
    if (constructName === "Direction") {
        storeValue = directionsStoreValue
    } else if (constructName === "Space") {
        storeValue = spacesStoreValue
    } else {
        storeValue = thingsStoreValue
    }
    
    // For single IDs, return the stored construct or null if there isn't one stored.
    if (typeof ids === "number") {
        const output = graphConstructInStore(constructName, ids) ? storeValue[ids] as Type : null
        return output
        
    // For an array of IDs, return an array of the stored constructs that match.
    } else {
        const output: Type[] = []
        for (const id of ids) {
            if (graphConstructInStore(constructName, id)) output.push(storeValue[id] as Type)
        }
        return output
    }
}