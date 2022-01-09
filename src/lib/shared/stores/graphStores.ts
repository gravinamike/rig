import type { Writable } from "svelte/store"
import type { GraphConstruct } from "$lib/shared/constants"
import type { Direction } from "$lib/shared/graph/constructs/direction"
import type { Space } from "$lib/shared/graph/constructs/space"
import type { Thing } from "$lib/shared/graph/constructs/thing"

import { writable, derived } from "svelte/store"
import { isDirection } from "$lib/shared/graph/constructs/direction"
import { isSpace } from "$lib/shared/graph/constructs/space"
import { isThing } from "$lib/shared/graph/constructs/thing"


// Create Direction-related stores (and subscriptions where applicable).
export const directionsStore = writable( {} as { [id: number]: Direction } )
let directionsStoreValue: { [id: number]: Direction }
directionsStore.subscribe(value => {directionsStoreValue = value})

export const directionsStoreAsArray = derived( directionsStore, $directionsStore => Object.values($directionsStore) )

export const directionIdsNotFoundStore = writable( [] as number[] );


// Create Space-related stores (and subscriptions where applicable).
export const spacesStore = writable( {} as { [id: number]: Space } )
let spacesStoreValue: { [id: number]: Space }
spacesStore.subscribe(value => {spacesStoreValue = value})

export const spacesStoreAsArray = derived( spacesStore, $spacesStore => Object.values($spacesStore) )

export const spaceIdsNotFoundStore = writable( [] as number[] );


// Create Things-related stores (and subscriptions where applicable).
export const thingsStore = writable( {} as { [id: number]: Thing } )
let thingsStoreValue: { [id: number]: Thing }
thingsStore.subscribe(value => {thingsStoreValue = value})

export const thingsStoreAsArray = derived( thingsStore, $thingsStore => Object.values($thingsStore) )

export const thingIdsNotFoundStore = writable( [] as number[] );


/* 
 * Function to add Graph constructs to stores.
 */
function updateConstructStore<Type extends GraphConstruct>( constructs: Type | Type[] ): void {
    // If necessary, pack a single supplied construct in an array for processing.
    if (!("length" in constructs)) constructs = [constructs]
    
    // Determine which store to update based on construct type.
    let store: Writable<{ [id: number]: GraphConstruct }>
    if ( isDirection(constructs[0]) ) {
        store = directionsStore
    } else if ( isSpace(constructs[0]) ) {
        store = spacesStore
    } else if ( isThing(constructs[0]) ) {
        store = thingsStore
    } else {
        return
    }

    // Update the store with each supplied construct.
    constructs.forEach((construct) => {
        store.update( (current) => { current[construct.id] = construct; return current } )
    })
}

/* 
 * Function to add Graph construct ids to stores.
 */
function updateIdStore( constructName: "Direction" | "Space" | "Thing", ids: number | number[] ): void {
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

    // Update the store with each supplied id.
    ids.forEach((id) => {
        store.update( (current) => { if (!current.includes(id)) current.push(id); return current } )
    })
}

/* 
 * Function to check whether a Graph construct is in the store (by ID).
 */
export function graphConstructInStore( constructName: "Direction" | "Space" | "Thing", id: number ): boolean {
    // Determine which store to check based on construct name.
    const storeValue = {
        "Direction": directionsStoreValue,
        "Space": spacesStoreValue,
        "Thing": thingsStoreValue
    }[constructName]

    // Determine if the construct id is in the store.
    return id in storeValue ? true : false
}

/* 
 * Function to fetch Graph constructs from the API, then add them to the stores.
 */
export async function storeGraphConstructs<Type extends GraphConstruct>(
    constructName: "Direction" | "Space" | "Thing",
    ids?: number | number[],
    allowUpdating = false
): Promise<Type[]> {
    // Determine which store to check based on construct name.
    const storeValue = {
        "Direction": directionsStoreValue,
        "Space": spacesStoreValue,
        "Thing": thingsStoreValue
    }[constructName]

    let res: Response
    let idsToQuery: number[] = []
    
    // If no IDs were provided, fetch all instances of this construct.
    if (typeof ids === "undefined") {
        res = await fetch(`api/${ constructName.toLowerCase() }s-all`)

    // Else, if IDs *were* provided,
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
        res = await fetch(`api/${ constructName.toLowerCase() }s-${idsToQuery.join(",")}`);
    }

    // If the response is ok,
    if (res.ok) {
        // Unpack the response JSON as an array of instances.
        const queriedInstances = await res.json() as Type[]
        // Update the store with these instances.
        updateConstructStore(queriedInstances)
        // Update the IDs Not Found store with any IDs that weren't fetched.
        if (!(typeof ids === "undefined")) {
            const idsFound = queriedInstances.map(x => x.id)
            const idsNotFound = idsToQuery.filter( x => !idsFound.includes(x) )
            updateIdStore(constructName, idsNotFound)
        }
        // Return the array of Directions.
        return queriedInstances

    // Handle errors if needed.
    } else {
        res.text().then(text => {throw Error(text)})
        return []
    }
}

/* 
 * Function to retrieve Graph constructs from the stores.
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