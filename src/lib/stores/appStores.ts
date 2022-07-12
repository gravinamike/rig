import { writable } from "svelte/store"


// Loading State Store.
// Holds a string specifying the current loading state of the app.
export const loadingState = writable(
    "start" as (
        "start" | "configLoading" | "configLoaded" | "graphLoading" | "graphLoaded" | "error"
    )
)


// Unigraph Folder Store.
// Holds the folder path for the currently-loaded Graph.
export const unigraphFolderStore = writable( null as string | null )


// Hovered Thing ID Store.
// Holds the ID of the Thing that the mouse is hovered over.
export const hoveredThingIdStore = writable( null as number | null )