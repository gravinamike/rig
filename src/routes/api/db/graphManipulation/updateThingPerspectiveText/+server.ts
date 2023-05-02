import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import { updateThingPerspectiveText } from "$lib/server/db"


export const POST: RequestHandler = async ({ request }) => {
    try {
        const body = await request.json()
        await updateThingPerspectiveText(body.pThingId, body.thingId, body.text)

        return new Response(JSON.stringify(
            {
                message: "Thing Perspective text updated successfully."
            }
        ))

    } catch(err) {
        throw error(500, `A server error occurred while attempting to update Thing Perspective text: ${err}`)
    }
}