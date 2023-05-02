import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import { markThingsVisited } from "$lib/server/db"


export const POST: RequestHandler = async ({ request }) => {
    try {
        const body = await request.json()
        await markThingsVisited(body.thingIdsToMarkVisited)
        
        return new Response(JSON.stringify(
            {
                message: "Thing(s) marked as visited."
            }
        ))

    } catch(err) {
        throw error(500, `A server error occurred while attempting to mark Thing(s) as visited: ${err}`)
    }
}