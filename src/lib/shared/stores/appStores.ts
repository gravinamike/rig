import { writable } from "svelte/store"


// Create navigation-related Stores.
export const pinIdsStore = writable( [] as number[] )

// Create UI-related stores.
export const hoveredThingIdStore = writable( null as number | null )