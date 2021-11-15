import { writable, derived } from "svelte/store"
import type { Direction, Space, Thing } from "$lib/shared/graph/graphDb"


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

// Create UI-related stores.
export const hoveredThingIdStore = writable( null as number | null )


/* 
 * Functions to get Directions, Spaces and Things from the API and add them to the stores.
 */
function updateDirectionsStore( directions: Direction | Direction[] ): void {
    if (!("length" in directions)) directions = [directions]
    directions.forEach((direction) => {
        directionsStore.update( (current) => { current[direction.id] = direction; return current } )
    })
}

function updateSpacesStore( spaces: Space | Space[] ): void {
    if (!("length" in spaces)) spaces = [spaces]
    spaces.forEach((space) => {
        spacesStore.update( (current) => { current[space.id] = space; return current } )
    })
}

function updateThingsStore( things: Thing | Thing[] ): void {
    if (!("length" in things)) things = [things]
    things.forEach((thing) => {
        thingsStore.update( (current) => { current[thing.id] = thing; return current } )
    })
}

function updateDirectionIdsNotFoundStore( ids: number | number[] ): void {
    if (typeof ids === "number") ids = [ids]
    ids.forEach((id) => {
        directionIdsNotFoundStore.update( (current) => { if (!current.includes(id)) current.push(id); return current } )
    })
}

function updateSpaceIdsNotFoundStore( ids: number | number[] ): void {
    if (typeof ids === "number") ids = [ids]
    ids.forEach((id) => {
        spaceIdsNotFoundStore.update( (current) => { if (!current.includes(id)) current.push(id); return current } )
    })
}

function updateThingIdsNotFoundStore( ids: number | number[] ): void {
    if (typeof ids === "number") ids = [ids]
    ids.forEach((id) => {
        thingIdsNotFoundStore.update( (current) => { if (!current.includes(id)) current.push(id); return current } )
    })
}


/* 
 * Functions to get Directions, Spaces and Things from the API and add them to the stores.
 */
export async function storeDirections( directionIds?: number | number[] ): Promise<Direction[]> {
    let res: Response
    let idsToQuery: number[] = []
    
    // If no ids were provided, fetch all Directions.
    if (typeof directionIds === "undefined") {
        res = await fetch("api/directions-all")

    // If ids were provided,
    } else {
        // Convert single ids into arrays for processing (if needed).
        if ( typeof directionIds === "number" ) directionIds = [directionIds]
        // Only fetch Directions that aren't already stored.
        const idsNotToQuery = Object.keys(directionsStoreValue).map(x => Number(x));
        idsToQuery = directionIds.filter( x => !idsNotToQuery.includes(x) )
        // Fetch the Directions from the API.
        res = await fetch(`api/directions-${idsToQuery.join(",")}`);
    }

    // If the response is ok,
    if (res.ok) {
        // Unpack the response JSON as an array of Directions.
        const queriedDirections = await res.json() as Direction[]
        // Update the store with these Directions.
        updateDirectionsStore(queriedDirections)
        // Update the IDs Not Found store with any IDs that weren't fetched.
        if (!(typeof directionIds === "undefined")) {
            const idsFound = queriedDirections.map(x => x.id)
            const idsNotFound = idsToQuery.filter( x => !idsFound.includes(x) )
            updateDirectionIdsNotFoundStore(idsNotFound)
        }
        // Return the array of Directions.
        return queriedDirections

    // Handle errors if needed.
    } else {
        res.text().then(text => {throw Error(text)})
        return []
    }
}

export async function storeSpaces( spaceIds?: number | number[] ): Promise<Space[]> {
    let res: Response
    let idsToQuery: number[] = []
    
    // If no ids were provided, fetch all Spaces.
    if (typeof spaceIds === "undefined") {
        res = await fetch("api/spaces-all")

    // If ids were provided,
    } else {
        // Convert single ids into arrays for processing (if needed).
        if ( typeof spaceIds === "number" ) spaceIds = [spaceIds]
        // Only fetch Spaces that aren't already stored.
        const idsNotToQuery = Object.keys(spacesStoreValue).map(x => Number(x));
        idsToQuery = spaceIds.filter( x => !idsNotToQuery.includes(x) )
        // Fetch the Spaces from the API.
        res = await fetch(`api/spaces-${idsToQuery.join(",")}`);
    }

    // If the response is ok,
    if (res.ok) {
        // Unpack the response JSON as an array of Spaces.
        const queriedSpaces = await res.json() as Space[]
        // Update the store with these Spaces.
        updateSpacesStore(queriedSpaces)
        // Update the IDs Not Found store with any IDs that weren't fetched.
        if (!(typeof spaceIds === "undefined")) {
            const idsFound = queriedSpaces.map(x => x.id)
            const idsNotFound = idsToQuery.filter( x => !idsFound.includes(x) )
            updateSpaceIdsNotFoundStore(idsNotFound)
        }
        // Return the array of Spaces.
        return queriedSpaces

    // Handle errors if needed.
    } else {
        res.text().then(text => {throw Error(text)})
        return []
    }
}

export async function storeThings( thingIds: number | number[] ): Promise<Thing[]> {
    // Convert single ids into arrays for processing (if needed).
    if ( typeof thingIds === "number" ) thingIds = [thingIds]

    // Only fetch Things that aren't already stored.
    const idsNotToQuery = Object.keys(thingsStoreValue).map(x => Number(x));
    const idsToQuery = thingIds.filter( x => !idsNotToQuery.includes(x) )

    // If there are no IDs to query, return an empty array.
    if (!idsToQuery.length) {
        return []

    // If there are IDs to query,
    } else {
        // Fetch the Things.
        const res = await fetch(`api/things-${idsToQuery.join(",")}`)

        // If the response is ok,
        if (res.ok) {
            // Unpack the response JSON as an array of Things.
            const queriedThings = await res.json() as Thing[]
            // Update the store with these Things.
            updateThingsStore(queriedThings)
            // Update the IDs Not Found store with any IDs that weren't fetched.
            const idsFound = queriedThings.map(x => x.id)
            const idsNotFound = idsToQuery.filter( x => !idsFound.includes(x) )
            updateThingIdsNotFoundStore(idsNotFound)
            // Return the array of Things.
            return queriedThings

        // Handle errors if needed.
        } else {
            res.text().then(text => {throw Error(text)})
            return []
        }
    }
}


/* 
 * Functions to check whether Directions, Spaces and Things are in the stores.
 */
export function directionInStore( directionId: number ): boolean {
    return directionId in directionsStoreValue ? true : false
}

export function spaceInStore( spaceId: number ): boolean {
    return spaceId in spacesStoreValue ? true : false
}

export function thingInStore( thingId: number ): boolean {
    return thingId in thingsStoreValue ? true : false
}


/* 
 * Functions to retrieve Directions, Spaces and Things from the stores.
 */
export function retrieveDirections( directionIds: number ): Direction | null
export function retrieveDirections( directionIds: number[] ): Direction[]
export function retrieveDirections( directionIds: number | number[] ): Direction[] | Direction | null {
    // For single IDs, return the stored Direction or null if there isn't one stored.
    if (typeof directionIds === "number") {
        const output = directionInStore(directionIds) ? directionsStoreValue[directionIds] : null
        return output
    // For an array of IDs, return an array of the stored Spaces that match.
    } else {
        const output: Direction[] = []
        for (const directionId of directionIds) {
            if (directionInStore(directionId)) output.push(directionsStoreValue[directionId])
        }
        return output
    }
}

export function retrieveSpaces( spaceIds: number ): Space | null
export function retrieveSpaces( spaceIds: number[] ): Space[]
export function retrieveSpaces( spaceIds: number | number[] ): Space[] | Space | null {
    // For single IDs, return the stored Space or null if there isn't one stored.
    if (typeof spaceIds === "number") {
        const output = spaceInStore(spaceIds) ? spacesStoreValue[spaceIds] : null
        return output
    // For an array of IDs, return an array of the stored Spaces that match.
    } else {
        const output: Space[] = []
        for (const spaceId of spaceIds) {
            if (spaceInStore(spaceId)) output.push(spacesStoreValue[spaceId])
        }
        return output
    }
}

export function retrieveThings( thingIds: number ): Thing | null
export function retrieveThings( thingIds: number[] ): Thing[]
export function retrieveThings( thingIds: number | number[] ): Thing[] | Thing | null {
    // For single IDs, return the stored Thing or null if there isn't one stored.
    if (typeof thingIds === "number") {
        const output = thingInStore(thingIds) ? thingsStoreValue[thingIds] : null
        return output
    // For an array of IDs, return an array of the stored Things that match.
    } else {
        const output: Thing[] = []
        for (const thingId of thingIds) {
            if (thingInStore(thingId)) output.push(thingsStoreValue[thingId])
        }
        return output
    }
}