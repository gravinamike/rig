// Import types.
import type { NewFileCreationInfo } from "$lib/widgets/dialogWidgets"

// Import SvelteKit framework resources.
import { writable } from "svelte/store"

// Import file-creation resources.
import { nullNewFileCreationInfo } from "$lib/widgets/dialogWidgets"

// Import session-specific fetch.
import { sessionSpecificFetch as fetch } from "$lib/db/sessionSpecificFetch"



/**
 * Database listening port store.
 * 
 * Holds the port number that the database listens on.
 */
export const dbPortStore = writable( 3000 )


/**
 * Base Graphs Folder Store.
 * 
 * Holds the folder path where the app finds Graph files.
 */
export const graphsBaseFolderStore = writable( "" )


/**
 * Graph Folders Store.
 * 
 * Holds a list of folder paths for each Graph in the Graphs directory.
 */
export const graphFoldersStore = writable( {} as {[username: string]: string[]} )

/**
 * Refresh-Graph-folders-store method.
 * 
 * Gets an object listing all valid Graph folders for the given user (if any) in addition to public
 * Graph folders.
 * @param username - The username to request a list of Graph folders for.
 * @returns - An object listing all valid Graph folders for the given user (if any) in addition to public Graph folders.
 */
export async function refreshGraphFoldersStore(username: string | null = null): Promise< void > {
    // Initialize a new, empty Graph-folder-by-username object.
    const graphFoldersByUsername: {[username: string]: string[]} = {}
    
    // Get the listing of public Graph folder names and add it to the object.
    await fetch(`/api/file/graphFolders-all`)
        .then(response => {return (response.json() as unknown) as string[]})
        .then(data => graphFoldersByUsername["all"] = data)
        
    // Get the listing of Graph folder names for the given user and add it to the object.
    if (username) await fetch(`api/file/graphFolders-${username}`)
        .then(response => {return (response.json() as unknown) as string[]})
        .then(data => graphFoldersByUsername[username] = data)

    // Set the Graph-folders store to the object.
    graphFoldersStore.set(graphFoldersByUsername)
}


/**
 * Unigraph folder Store.
 * 
 * Holds the folder path for the currently-loaded Graph.
 */
export const unigraphFolderStore = writable( null as string | null )



/**
 * New Graph-file creation store.
 * 
 * Holds information about the in-process Graph-file creation operation (or lack thereof).
 */
export const newGraphFileCreationStore = writable(
    {
        dialogOpen: false,
        username: null,
        newFileName: null
    } as NewFileCreationInfo
)

/**
 * Enable-new-file-creation method.
 * 
 * Sets the new Graph-file creation store to initial values to start a Graph-file creation
 * operation.
 * @param username - The username for whom the new Graph file will be created.
 */
export function enableNewFileCreation(username: string): void {
    newGraphFileCreationStore.set(
        {
            dialogOpen: true,
            username: username === "all" ? null : username,
            newFileName: null
        }
    )
}

/**
 * Update-new-file-creation-file-name method.
 * 
 * As part of a Graph-file creation operation, updates the name of the to-be-created file in the
 * store.
 * @param newFileName - The name of the to-be-created file.
 */
export function updateNewFileCreationFileName(newFileName: string): void {
    newGraphFileCreationStore.update( current => {
        current.newFileName = newFileName
        return current
    } )
}

/**
 * Disable-new-file-creation method.
 * 
 * Sets the new Graph-file creation store to null values to end a Graph-file creation operation.
 */
export function disableNewFileCreation(): void {
    newGraphFileCreationStore.update( () => nullNewFileCreationInfo )
}