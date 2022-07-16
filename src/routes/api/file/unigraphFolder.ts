import { get as getStore } from "svelte/store"
import { unigraphFolderStore } from "$lib/stores/fileStores"


export async function get(): Promise<{
    status: number,
    body: string | null | { error: string }
}> {
    try {
        const unigraphFolder = getStore(unigraphFolderStore)
        return {
            status: 200,
            body: unigraphFolder
        }
    } catch(err) {
        return {
            status: 500,
            body: { error: `A server error occurred while attempting to get Unigraph folder.` }
        }
    }
}

export async function post(
    {request}: {request: Request}
): Promise<{status: number, body: string | {error: string}}> {
    try {
        const unigraphFolder = await request.json()
        unigraphFolderStore.set(unigraphFolder)
        
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