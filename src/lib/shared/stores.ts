import { writable, derived } from 'svelte/store'
import type { Space, Thing } from "$lib/shared/graph/graphDb"


// Create Space-related stores.
const s: { [id: number]: Space } = {};
export const spacesStore = writable( s );

export const spacesStoreAsArray = derived(
    spacesStore,
    $spacesStore => Object.values($spacesStore)
)

const snf: number[] = [];
export const spaceIdsNotFoundStore = writable( snf );

// Create Things-related stores.
const t: { [id: number]: Thing } = {};
export const thingsStore = writable( t );

export const thingsStoreAsArray = derived(
    thingsStore,
    $thingsStore => Object.values($thingsStore)
)

const tinf: number[] = [];
export const thingIdsNotFoundStore = writable( tinf );

// Subscribe to stores in order to access their values.
let spacesStoreValue: { [id: number]: Space };
spacesStore.subscribe(value => {spacesStoreValue = value});
let thingsStoreValue: { [id: number]: Thing };
thingsStore.subscribe(value => {thingsStoreValue = value});


// Functions to update stores.
export function updateSpacesStore( spaces: Space | Space[] ): void {
    if (!("length" in spaces)) spaces = [spaces]
    spaces.forEach((space) => {
        spacesStore.update( (current) => { current[space.id] = space; return current } )
    })
}

export function updateThingsStore( things: Thing | Thing[] ): void {
    if (!("length" in things)) things = [things]
    things.forEach((thing) => {
        thingsStore.update( (current) => { current[thing.id] = thing; return current } )
    })
}

export function updateSpaceIdsNotFoundStore( ids: number | number[] ): void {
    if (typeof ids === "number") ids = [ids]
    ids.forEach((id) => {
        spaceIdsNotFoundStore.update( (current) => { if (!current.includes(id)) current.push(id); return current } )
    })
}

export function updateThingIdsNotFoundStore( ids: number | number[] ): void {
    if (typeof ids === "number") ids = [ids]
    ids.forEach((id) => {
        thingIdsNotFoundStore.update( (current) => { if (!current.includes(id)) current.push(id); return current } )
    })
}

// Functions to get Spaces and Things from the API and add them to the stores.
export async function storeSpaces( spaceIds?: number | number[] ): Promise<Space[]> {
    let res: Response
    if (typeof spaceIds === "undefined") {
        res = await fetch("api/spaces-all");
    } else {
        if ( typeof spaceIds === "number" ) spaceIds = [spaceIds];
        const idsNotToQuery = Object.keys(spacesStoreValue).map(x => Number(x));
        const idsToQuery = spaceIds.filter( x => !idsNotToQuery.includes(x) )
        res = await fetch(`api/spaces-${idsToQuery.join(",")}`);
    }

    if (res.ok) {
        const queriedSpaces = await res.json() as Space[]
        updateSpacesStore(queriedSpaces)
        if (!(typeof spaceIds === "undefined")) {
            const idsFound = queriedSpaces.map(x => x.id)
            const idsNotFound = spaceIds.filter( x => !idsFound.includes(x) )
            updateSpaceIdsNotFoundStore(idsNotFound)
        }
        return queriedSpaces
    } else {
        res.text().then(text => {throw Error(text)})
        return []
    }
}

export function retrieveSpaces( spaceIds: number ): Space | null
export function retrieveSpaces( spaceIds: number[] ): Space[]
export function retrieveSpaces( spaceIds: number | number[] ): Space[] | Space | null {
    if (typeof spaceIds === "number") {
        const output = spaceIds in spacesStoreValue ? spacesStoreValue[spaceIds] : null
        return output
    } else {
        const output: Space[] = []
        for (const spaceId of spaceIds) {
            if (spaceId in spacesStoreValue) output.push(spacesStoreValue[spaceId])
        }
        return output
    }
}

export function spaceInStore( spaceId: number ): boolean {
    if (spaceId in spacesStoreValue) return true
    return false
}

export async function storeThings( thingIds: number | number[] ): Promise<Thing[]> {
    if ( typeof thingIds === "number" ) thingIds = [thingIds]
    const idsNotToQuery = Object.keys(thingsStoreValue).map(x => Number(x));
    const idsToQuery = thingIds.filter( x => !idsNotToQuery.includes(x) )

    if (!idsToQuery.length) {
        return []
    } else {
        const res = await fetch(`api/things-${idsToQuery.join(",")}`)

        if (res.ok) {
            const queriedThings = await res.json() as Thing[]
            updateThingsStore(queriedThings)
            const idsFound = queriedThings.map(x => x.id)
            const idsNotFound = idsToQuery.filter( x => !idsFound.includes(x) )
            updateThingIdsNotFoundStore(idsNotFound)
            return queriedThings
        } else {
            res.text().then(text => {throw Error(text)})
            return []
        }
    }
}

export function retrieveThings( thingIds: number ): Thing | null
export function retrieveThings( thingIds: number[] ): Thing[]
export function retrieveThings( thingIds: number | number[] ): Thing[] | Thing | null {
    if (typeof thingIds === "number") {
        const output = thingIds in thingsStoreValue ? thingsStoreValue[thingIds] : null
        return output
    } else {
        const output: Thing[] = []
        for (const thingId of thingIds) {
            if (thingId in thingsStoreValue) output.push(thingsStoreValue[thingId])
        }
        return output
    }
}

export function thingInStore( thingId: number ): boolean {
    if (thingId in thingsStoreValue) return true
    return false
}