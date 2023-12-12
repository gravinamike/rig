import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import { updateThingPerspectiveText } from "$lib/server/db"
import { getGraphNameOnServer } from "$lib/server/db/utility"


export const POST: RequestHandler = async ({ request, params }) => {
    try {
        const graphName = getGraphNameOnServer(request, params)
        const body = await request.json()
        await updateThingPerspectiveText(
            graphName,
            body.pThingId,
            body.thingId,
            body.text
        )

        return new Response(JSON.stringify(
            {
                message: "Thing Perspective text updated successfully."
            }
        ))

    } catch(err) {
        throw error(500, `A server error occurred while attempting to update Thing Perspective text: ${err}`)
    }
}