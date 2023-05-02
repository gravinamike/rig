import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import { addFolderToThing } from "$lib/server/db"


export const POST: RequestHandler = async ({ request }) => {
    try {
        const body = await request.json()
        await addFolderToThing(body.thingId)
        
        return new Response(JSON.stringify(
            {
                message: "New Folder added to Thing successfully."
            }
        ))

    } catch(err) {
        throw error(500, `A server error occurred while attempting to add new Folder to Thing: ${err}`)
    }
}