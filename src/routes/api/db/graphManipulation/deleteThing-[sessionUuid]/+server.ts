import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import { deleteThing } from "$lib/server/db"


export const POST: RequestHandler = async ({ request }) => {
    try {
        const body = await request.json()
        await deleteThing(body.thingIdToDelete)
        
        return new Response(JSON.stringify(
            {
                message: "Thing deleted successfully."
            }
        ))

    } catch(err) {
        throw error(500, `A server error occurred while attempting to delete Thing: ${err}`)
    }
}