import type { NewFileCreationInfo } from "$lib/widgets/dialogWidgets"

import { sessionSpecificFetch as fetch } from "$lib/db/sessionSpecificFetch"

import { derived, writable } from "svelte/store"
import { nullNewFileCreationInfo } from "$lib/widgets/dialogWidgets"
import { defaultUITrimColor, defaultMobileMenuTrimColor, defaultGraphBackgroundColor } from "$lib/shared/constants"
import { clampNumber } from "$lib/shared/utility"











export function lightenOrDarkenColorString(colorString: string, lighterOrDarker: "lighter" | "darker", percentChange: number) {

    const isColorStringHexColor = /^#[0-9A-F]{6}[0-9a-f]{0,2}$/i.test(colorString)
    if (!isColorStringHexColor) {
        console.log(`"${colorString}" is an invalid color hex code. Outputting white ("#ffffff") as a fallback.`)
        return "#ffffff"
    }

    percentChange = clampNumber(percentChange, 0, 100)


    const changeLimit = lighterOrDarker === "lighter" ? 255 : 0



  
    const colorStringWithoutHash = colorString.replace("#", "")
    const colorStringAsInteger = parseInt(colorStringWithoutHash, 16)
 




    const redComponent = ( colorStringAsInteger >> 16 )
    const redDistanceToLimit = changeLimit - redComponent
    const redAmountToChange = redDistanceToLimit * ( percentChange / 100 )
    const adjustedRedComponent = redComponent + redAmountToChange
    //const adjustedRedComponent = clampNumber(redComponent, 0, 255)

    const blueComponent = ( (colorStringAsInteger >> 8) & 0x00FF )
    const blueDistanceToLimit = changeLimit - blueComponent
    const blueAmountToChange = blueDistanceToLimit * ( percentChange / 100 )
    const adjustedBlueComponent = blueComponent + blueAmountToChange
    //const adjustedBlueComponent = clampNumber(blueComponent, 0, 255)
 
    const greenComponent = ( colorStringAsInteger & 0x0000FF )
    const greenDistanceToLimit = changeLimit - greenComponent
    const greenAmountToChange = greenDistanceToLimit * ( percentChange / 100 )
    const adjustedGreenComponent = greenComponent + greenAmountToChange
    //const adjustedGreenComponent = clampNumber(greenComponent, 0, 255)

    const adjustedColorString = `#${(
        adjustedGreenComponent | (adjustedBlueComponent << 8) | (adjustedRedComponent << 16)
    ).toString(16)}`
 
    return adjustedColorString
}







// UI trim and background color stores.
// Hold the hex-strings for the UI's trim and background colors.
export const uITrimColorStore = writable( defaultUITrimColor )
export const uIBackgroundColorStore = derived(
    uITrimColorStore,
    ($uITrimColor) => lightenOrDarkenColorString($uITrimColor, "lighter", 95)
)
export const uIHeaderColorStore = derived(
    uITrimColorStore,
    ($uITrimColor) => lightenOrDarkenColorString($uITrimColor, "darker", 15)
)
export const mobileMenuTrimColorStore = writable( defaultMobileMenuTrimColor )
export const graphBackgroundColorStore = writable( defaultGraphBackgroundColor )


// Font stores.
// Hold the default and title fonts for the Graph.
export const defaultFontStore = writable( null as string | null )
export const titleFontStore = writable( null as string | null )
export const titleFontWeightStore = writable( 600 as number | null )




















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