// Import types.
import type { NewFileCreationInfo } from "$lib/widgets/dialogWidgets"

// Import SvelteKit framework resources.
import { writable } from "svelte/store"

// Import file-creation resources.
import { nullNewFileCreationInfo } from "$lib/widgets/dialogWidgets"

// Import session-specific fetch.
import { sessionSpecificFetch as fetch } from "$lib/db/sessionSpecificFetch"







// Database listening port store.
// Holds the port number that the database listens on.
export const dbPortStore = writable( 3000 )


// Base Graphs Folder Store.
// Holds the folder path where the app finds Graph files.
export const graphsBaseFolderStore = writable( "" )


// Graph Folders Store.
// Holds a list of folder paths for each Graph in the Graphs directory.
export const graphFoldersStore = writable( {} as {[username: string]: string[]} )

export async function refreshGraphFoldersStore(username: string | null = null): Promise< void > {
    const graphFoldersByUsername: {[username: string]: string[]} = {}
    
    await fetch(`/api/file/graphFolders-all`)
        .then(response => {return (response.json() as unknown) as string[]})
        .then(data => graphFoldersByUsername["all"] = data)
        
    if (username) await fetch(`api/file/graphFolders-${username}`)
        .then(response => {return (response.json() as unknown) as string[]})
        .then(data => graphFoldersByUsername[username] = data)

    graphFoldersStore.set(graphFoldersByUsername)
}



// Unigraph Folder Store.
// Holds the folder path for the currently-loaded Graph.
export const unigraphFolderStore = writable( null as string | null )




export const newGraphFileCreationStore = writable(
    {
        dialogOpen: false,
        username: null,
        newFileName: null
    } as NewFileCreationInfo
)

export function enableNewFileCreation(username: string): void {
    newGraphFileCreationStore.set(
        {
            dialogOpen: true,
            username: username === "all" ? null : username,
            newFileName: null
        }
    )
}

export function updateNewFileCreationFileName(newFileName: string): void {
    newGraphFileCreationStore.update( current => {
        current.newFileName = newFileName
        return current
    } )
}

export function disableNewFileCreation(): void {
    newGraphFileCreationStore.update( () => nullNewFileCreationInfo )
}