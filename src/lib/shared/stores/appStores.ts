import { writable } from "svelte/store"


// Create UI-related stores.
export const hoveredThingIdStore = writable( null as number | null )