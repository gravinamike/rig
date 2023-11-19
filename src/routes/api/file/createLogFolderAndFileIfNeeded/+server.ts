import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import { createLogFolderAndFileIfNeeded } from "$lib/shared/fileSystem"


export const POST: RequestHandler = async () => {
    try {
        await createLogFolderAndFileIfNeeded()
        
        return new Response(JSON.stringify(
            {
                message: "Log file initialized/verified."
            }
        ))

    } catch(err) {
        throw error(500, `A server error occurred while attempting to initialize/verify the log file: ${err}`)
    }
}