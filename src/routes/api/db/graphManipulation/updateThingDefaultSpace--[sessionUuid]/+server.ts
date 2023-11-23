import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import { updateThingDefaultSpace } from "$lib/server/db"


export const POST: RequestHandler = async ({ request }) => {
    try {
        const body = await request.json()
        await updateThingDefaultSpace(body.thingId, body.spaceId)
        
        return new Response(JSON.stringify(
            {
                message: "Note updated successfully."
            }
        ))

    } catch(err) {
        throw error(500, `A server error occurred while attempting to update Thing's default Space: ${err}`)
    }
}