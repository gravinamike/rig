import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import { createNewGraphFile } from "$lib/shared/fileSystem"


export const POST: RequestHandler = async ({ request }) => {
    try {
        const body = await request.json()
        await createNewGraphFile(body.newGraphName)
        
        return new Response(JSON.stringify(
            {
                message: "New Graph file created."
            }
        ))

    } catch(err) {
        throw error(500, `A server error occurred while attempting to create new Graph file: ${err}`)
    }
}