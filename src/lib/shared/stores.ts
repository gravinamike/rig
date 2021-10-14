import { writable, derived } from 'svelte/store';
import type { Space, Thing } from "$lib/shared/graph";


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

const tnf: number[] = [];
export const thingIdsNotFoundStore = writable( tnf );

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
export async function storeSpaces( spaceIds?: number | number[] ): Promise<void> {
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
    } else {
        res.text().then(text => {throw Error(text)})
    }
}

export async function storeThings( thingIds: number | number[] ): Promise<void> {
    if ( typeof thingIds === "number" ) thingIds = [thingIds]
    const idsNotToQuery = Object.keys(thingsStoreValue).map(x => Number(x));
    const idsToQuery = thingIds.filter( x => !idsNotToQuery.includes(x) )
    const res = await fetch(`api/things-${idsToQuery.join(",")}`)

    if (res.ok) {
        const queriedThings = await res.json() as Thing[]
        updateThingsStore(queriedThings)
        const idsFound = queriedThings.map(x => x.id)
        const idsNotFound = thingIds.filter( x => !idsFound.includes(x) )
        updateThingIdsNotFoundStore(idsNotFound)
    } else {
        res.text().then(text => {throw Error(text)})
    }
}