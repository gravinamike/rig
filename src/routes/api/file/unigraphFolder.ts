import path from "path"
import { graphsBaseFolder } from "$lib/shared/constants"
import { get as getStore } from "svelte/store"
import { unigraphFolderStore } from "$lib/stores/appStores"


export async function get(): Promise<{///////////////////////////// IS THIS FUNCTION NECESSARY?
    status: number,
    body: string | null | { error: string }
}> {
    try {
        const unigraphFolder = getStore(unigraphFolderStore)
        const unigraphFolderPath = unigraphFolder ?
            path.join(graphsBaseFolder, unigraphFolder) :
            null
        console.log(unigraphFolderPath)
        return {
            status: 200,
            body: unigraphFolderPath
        }

    } catch(err) {
        return {
            status: 500,
            body: { error: `A server error occurred while attempting to get unigraph folder.` }
        }
    }
}

export async function post(
    {request}: {request: Request}
): Promise<{status: number, body: string | {error: string}}> {
    try {
        const unigraphFolder = await request.json()
        unigraphFolderStore.set(unigraphFolder)
        console.log("SET FOLDER:", unigraphFolder)
        
        return {
            status: 200,
            body: `Unigraph folder set to ${unigraphFolder}.`
        }

    } catch(err) {
        return {
            status: 500,
            body: { error: `A server error occurred while attempting to set Unigraph folder.`}
        }
    }
}