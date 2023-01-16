import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import { listGraphsFolder } from "$lib/shared/fileSystem"


export const GET: RequestHandler = async () => {
    try {
        const folderListing = await listGraphsFolder()

        return new Response(JSON.stringify(folderListing))

    } catch(err) {
        throw error(500, `A server error occurred while attempting to get Graph folders listing: ${err}`)
    }
}