import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import { listGraphFolderForUsername } from "$lib/shared/fileSystem"


export const GET: RequestHandler = async ({ params }) => {
    try {
        const username = params.username || null

        const folderListing = username ? await listGraphFolderForUsername(username) : []
        
        return new Response(JSON.stringify(folderListing))

    } catch(err) {
        throw error(500, `A server error occurred while attempting to get Graph folders listing: ${err}`)
    }
}