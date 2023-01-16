import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import { listAttachmentsFolder } from "$lib/shared/fileSystem"


export const GET: RequestHandler = async ({ params }) => {
    try {
        const folderGuid = params.folderGuid || ""

        const folderInfo = await listAttachmentsFolder(folderGuid)
        
        return new Response(JSON.stringify(folderInfo))

    } catch(err) {
        throw error(500, `A server error occurred while attempting to get Attachments folder listing: ${err}`)
    }
}