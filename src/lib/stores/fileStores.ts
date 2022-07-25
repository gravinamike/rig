import type { NewFileCreationInfo } from "$lib/widgets/dialogWidgets"

import { writable } from "svelte/store"
import { nullNewFileCreationInfo } from "$lib/widgets/dialogWidgets"



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