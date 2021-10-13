import { writable, derived } from 'svelte/store';
import type { Space, Thing } from "$lib/shared/graph";


// Create Space-related stores.
const s: { [id: number]: Space } = {};
export const spacesStore = writable( s );

export const spacesStoreAsArray = derived(
    spacesStore,
    $spacesStore => Object.values($spacesStore)
)

// Create Things-related stores.
const t: { [id: number]: Thing } = {};
export const thingsStore = writable( t );

export const thingsStoreAsArray = derived(
    thingsStore,
    $thingsStore => Object.values($thingsStore)
)

// Subscribe to stores in order to access their values.
let spacesStoreValue: { [id: number]: Space };
spacesStore.subscribe(value => {spacesStoreValue = value});
let thingsStoreValue: { [id: number]: Thing };
thingsStore.subscribe(value => {thingsStoreValue = value});


// Functions to update stores.
export function updateSpacesStore( id: number, space: Space): void {
    spacesStore.update( (current) => { current[id] = space; return current } )
}

export function updateThingsStore( id: number, thing: Thing): void {
    thingsStore.update( (current) => { current[id] = thing; return current } )
}

// Functions to get Spaces and Things from the API and add them to the stores.
export async function storeSpaces( spaceIds?: number | number[] ): Promise<void> {
    let res: Response
    if (typeof spaceIds === "undefined") {
        res = await fetch("api/spaces-all");
    } else {
        if ( typeof spaceIds === "number" ) spaceIds = [spaceIds];
        const idsNotToQuery = Object.keys(spacesStoreValue).map(x => Number(x));
        const idsToQuery = spaceIds.filter( e => !idsNotToQuery.includes(e) )
        res = await fetch(`api/spaces-${idsToQuery.join(",")}`);
    }

    if (res.ok) {
        const queriedSpaces = await res.json() as Space[]
        for (const queriedSpace of queriedSpaces) {
            updateSpacesStore(queriedSpace.id, queriedSpace)
        }
    } else {
        res.text().then(text => {throw Error(text)})
    }
}

export async function storeThings( thingIds: number | number[] ): Promise<void> {
    if ( typeof thingIds === "number" ) thingIds = [thingIds]
    const idsNotToQuery = Object.keys(thingsStoreValue).map(x => Number(x));
    const idsToQuery = thingIds.filter( e => !idsNotToQuery.includes(e) )
    const res = await fetch(`api/things-${idsToQuery.join(",")}`)

    if (res.ok) {
        const queriedThings = await res.json() as Thing[]
        for (const queriedThing of queriedThings) {
            updateThingsStore(queriedThing.id, queriedThing)
        }
    } else {
        res.text().then(text => {throw Error(text)})
    }
}