import type { Writable } from "svelte/store"
import type { GraphConstruct, Direction, Space, Thing } from "$lib/shared/graph/graphDbConstructs"
import { writable, derived } from "svelte/store"
import { isDirection, isSpace, isThing } from "$lib/shared/graph/graphDbConstructs"


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
    if (!("length" in constructs)) constructs = [constructs]

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

    constructs.forEach((construct) => {
        store.update( (current) => { current[construct.id] = construct; return current } )
    })
}

/* 
 * Function to add Graph construct ids to stores.
 */
function updateIdStore( constructName: "Direction" | "Space" | "Thing", ids: number | number[] ): void {
    if (typeof ids === "number") ids = [ids]

    let store: Writable<number[]>
    if (constructName === "Direction") {
        store = directionIdsNotFoundStore
    } else if (constructName === "Space") {
        store = spaceIdsNotFoundStore
    } else if (constructName === "Thing") {
        store = thingIdsNotFoundStore
    }

    ids.forEach((id) => {
        store.update( (current) => { if (!current.includes(id)) current.push(id); return current } )
    })
}

/* 
 * Functions to check whether Graph constructs are in the stores.
 */
export function graphConstructInStore( constructName: "Direction" | "Space" | "Thing", id: number ): boolean {
    const storeValue = {
        "Direction": directionsStoreValue,
        "Space": spacesStoreValue,
        "Thing": thingsStoreValue
    }[constructName]

    return id in storeValue ? true : false
}

/* 
 * Function to fetch Graph constructs from the API, then add them to the stores.
 */
export async function storeGraphConstructs<Type extends GraphConstruct>( constructName: "Direction" | "Space" | "Thing", ids?: number | number[] ): Promise<Type[]> {
    const storeValue = {
        "Direction": directionsStoreValue,
        "Space": spacesStoreValue,
        "Thing": thingsStoreValue
    }[constructName]

    let res: Response
    let idsToQuery: number[] = []
    
    // If no ids were provided, fetch all instances of this construct.
    if (typeof ids === "undefined") {
        res = await fetch(`api/${ constructName.toLowerCase() }s-all`)

    // If ids were provided,
    } else {
        // Convert single ids into arrays for processing (if needed).
        if ( typeof ids === "number" ) ids = [ids]
        // Only fetch instances that aren't already stored.
        const idsNotToQuery = Object.keys(storeValue).map(x => Number(x));
        idsToQuery = ids.filter( x => !idsNotToQuery.includes(x) )
        // Fetch the instances from the API.
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
    let storeValue: { [id: number]: GraphConstruct }
    if (constructName === "Direction") {
        storeValue = directionsStoreValue
    } else if (constructName === "Space") {
        storeValue = spacesStoreValue
    } else {
        storeValue = thingsStoreValue
    }
    storeValue
    
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