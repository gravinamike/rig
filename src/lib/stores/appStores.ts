// Import SvelteKit framework resources.
import { writable } from "svelte/store"



/**
 * User ID store.
 * 
 * Holds an ID string that uniquely identifies the user.
 */
export const userIdStore = writable( null as string | null )

/**
 * Session UUID store.
 * 
 * Holds a UUID string that uniquely identifies the session.
 */
export const sessionUuidStore = writable( "" )


/**
 * Font names store.
 * 
 * Holds an array of font names the application can use.
 */
export const fontNames = writable( [] as string[] )


/**
 * Landscape-orientation flag store.
 * 
 * Holds a boolean specifying whether the screen is wider than it is tall.
 */
export const landscapeOrientation = writable( false )


/**
 * Dev-mode flag store.
 * 
 * Holds a boolean specifying whether the app is running in dev mode.
 */
export const devMode = writable( false )



/**
 * Loading state store.
 * 
 * Holds a string specifying the current loading state of the app.
 */
export const loadingState = writable(
    "start" as (
        "start" | "configLoading" | "configLoaded" | "graphLoading" | "graphLoaded" | "error"
    )
)


/**
 * Read-only-mode flag store.
 * 
 * Holds a boolean specifying whether the app is running in read-only-mode.
 */
export const readOnlyMode = writable( false )


/**
 * Hovered Thing ID store.
 * 
 * Holds the ID of the Thing that the mouse is hovered over.
 */
export const hoveredThingIdStore = writable( null as number | null )