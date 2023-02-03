import type { NewFileCreationInfo } from "$lib/widgets/dialogWidgets"

import { sessionSpecificFetch as fetch } from "$lib/db/utility/sessionSpecificFetch"

import { writable } from "svelte/store"
import { nullNewFileCreationInfo } from "$lib/widgets/dialogWidgets"
import { defaultUIBackgroundColor, defaultUITrimColor } from "$lib/shared/constants"



// UI trim and background color stores.
// Hold the hex-strings for the UI's trim and background colors.
export const uIBackgroundColorStore = writable( defaultUIBackgroundColor )
export const uITrimColorStore = writable( defaultUITrimColor )


// Graph and Notes background image path stores.
// Hold the file names for the Graph and Notes background images.
export const graphBackgroundImageStore = writable( null as string | null )
export const notesBackgroundImageStore = writable( null as string | null )


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