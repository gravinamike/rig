import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import { graphNeedsRepair } from "$lib/db/serverSide/graphFile"


export const GET: RequestHandler = async () => {
    try {
        const isUpdated = await graphNeedsRepair()

        return new Response(JSON.stringify(isUpdated))

    } catch(err) {
        throw error(500, `A server error occurred while attempting to get repair status of Graph: ${err}`)
    }
}