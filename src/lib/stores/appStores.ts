import { writable } from "svelte/store"



// Dev-mode flag store.
// Holds a boolean specifying whether the app is running in dev mode.
export const devMode = writable( false )



// Font names store.
// Holds an array of font names the application can use.
export const fontNames = writable( [] as string[] )



// Loading state store.
// Holds a string specifying the current loading state of the app.
export const loadingState = writable(
    "start" as (
        "start" | "configLoading" | "configLoaded" | "graphLoading" | "graphLoaded" | "error"
    )
)


// Hovered Thing ID store.
// Holds the ID of the Thing that the mouse is hovered over.
export const hoveredThingIdStore = writable( null as number | null )