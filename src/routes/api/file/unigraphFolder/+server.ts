import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import { get as getStore } from "svelte/store"
import { unigraphFolderStore } from "$lib/stores/fileStores"


export const GET: RequestHandler = async () => {
    try {
        const unigraphFolder = getStore(unigraphFolderStore)

        return new Response(JSON.stringify(unigraphFolder))
    } catch(err) {
        throw error(500, `A server error occurred while attempting to get Unigraph folder.`)
    }
}

export const POST: RequestHandler = async ({ request }) => {
    try {
        const unigraphFolder = await request.json()
        unigraphFolderStore.set(unigraphFolder)
        
        return new Response(JSON.stringify(
            {
                message: `Unigraph folder set to ${unigraphFolder}.`
            }
        ))

    } catch(err) {
        throw error(500, `A server error occurred while attempting to set Unigraph folder.`)
    }
}