import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import { getLatestConstructs } from "$lib/server/db"


export const GET: RequestHandler = async () => {
    try {
        const latestConstructs = await getLatestConstructs()
        
        return new Response(JSON.stringify(latestConstructs))

    } catch(err) {
        throw error(500, `A server error occurred while attempting to get latest database Constructs: ${err}`)
    }
}