import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import { updateThingText } from "$lib/server/db"
import { getGraphNameOnServer } from "$lib/server/db/utility"


export const POST: RequestHandler = async ({ request, params }) => {
    try {
        const graphName = getGraphNameOnServer(request, params)
        const body = await request.json()
        await updateThingText(
            graphName,
            body.thingId,
            body.text
        )
        
        return new Response(JSON.stringify(
            {
                message: "Thing text updated successfully."
            }
        ))

    } catch(err) {
        throw error(500, `A server error occurred while attempting to update Thing text: ${err}`)
    }
}