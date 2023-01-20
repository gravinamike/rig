import type { NewFileCreationInfo } from "$lib/widgets/dialogWidgets"

import { writable } from "svelte/store"
import { nullNewFileCreationInfo } from "$lib/widgets/dialogWidgets"



// Database listening port store.
// Holds the port number that the database listens on.
export const dbPortStore = writable( 3000 )


// Base Graphs Folder Store.
// Holds the folder path where the app finds Graph files.
export const graphsBaseFolderStore = writable( "" )


// Graph Folders Store.
// Holds a list of folder paths for each Graph in the Graphs directory.
export const graphFoldersStore = writable( [] as string[] )

export async function refreshGraphFoldersStore(): Promise< void > {
    await fetch(`api/file/graphFolders`)
        .then(response => {return (response.json() as unknown) as string[]})
        .then(data => graphFoldersStore.set(data))
}



// Unigraph Folder Store.
// Holds the folder path for the currently-loaded Graph.
export const unigraphFolderStore = writable( null as string | null )




export const newFileCreationStore = writable(
    {
        dialogOpen: false,
        newFileName: null
    } as NewFileCreationInfo
)

export function enableNewFileCreation(): void {
    newFileCreationStore.set(
        {
            dialogOpen: true,
            newFileName: null
        }
    )
}

export function updateNewFileCreationFileName(newFileName: string): void {
    newFileCreationStore.update( current => {
        current.newFileName = newFileName
        return current
    } )
}

export function disableNewFileCreation(): void {
    newFileCreationStore.update( () => nullNewFileCreationInfo )
}