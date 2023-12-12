import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import { addFolderToThing } from "$lib/server/db"
import { getGraphNameOnServer } from "$lib/server/db/utility"


export const POST: RequestHandler = async ({ request, params }) => {
    try {
        const graphName = getGraphNameOnServer(request, params)
        const body = await request.json()
        await addFolderToThing(
            graphName,
            body.thingId
        )
        
        return new Response(JSON.stringify(
            {
                message: "New Folder added to Thing successfully."
            }
        ))

    } catch(err) {
        throw error(500, `A server error occurred while attempting to add new Folder to Thing: ${err}`)
    }
}