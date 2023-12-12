import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import { updateThingDefaultSpace } from "$lib/server/db"
import { getGraphNameOnServer } from "$lib/server/db/utility"


export const POST: RequestHandler = async ({ request, params }) => {
    try {
        const graphName = getGraphNameOnServer(request, params)
        const body = await request.json()
        await updateThingDefaultSpace(
            graphName,
            body.thingId,
            body.spaceId
        )
        
        return new Response(JSON.stringify(
            {
                message: "Note updated successfully."
            }
        ))

    } catch(err) {
        throw error(500, `A server error occurred while attempting to update Thing's default Space: ${err}`)
    }
}