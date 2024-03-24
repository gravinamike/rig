import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import { updateThingDefaultContentViewer } from "$lib/server/db"
import { getGraphNameOnServer } from "$lib/server/db/utility"


export const POST: RequestHandler = async ({ request, params }) => {
    try {
        const graphName = getGraphNameOnServer(request, params)
        const body = await request.json()
        await updateThingDefaultContentViewer(
            graphName,
            body.thingId,
            body.defaultContentViewer
        )
        
        return new Response(JSON.stringify(
            {
                message: "Default content viewer updated successfully."
            }
        ))

    } catch(err) {
        throw error(500, `A server error occurred while attempting to update Thing's default content viewer: ${err}`)
    }
}