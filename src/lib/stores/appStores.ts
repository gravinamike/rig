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
 * Can-access-file-menu store.
 * 
 * Holds an array of usernames that have access to the File menu.
 */
export const canAccessFileMenuStore = writable( [] as string[] )



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
 * Can-edit array store.
 * 
 * Holds an array of usernames that are permitted to edit the Graph.
 */
export const canEdit = writable( [] as string[] )


/**
 * Prevent-editing flag store.
 * 
 * Holds a boolean specifying whether the user is allowed to edit the Graph. Set based on
 * whether `readOnlyMode` is true and the current username is included in the `canEdit` array.
 */
export const preventEditing = writable( false )



/**
 * Hovered Thing ID store.
 * 
 * Holds the ID of the Thing that the mouse is hovered over.
 */
export const hoveredThingIdStore = writable( null as number | null )