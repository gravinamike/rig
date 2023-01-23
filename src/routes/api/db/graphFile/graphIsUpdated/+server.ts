import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import { graphIsUpdated } from "$lib/db/serverSide/graphFile"


export const GET: RequestHandler = async () => {
    try {
        const isUpdated = await graphIsUpdated()

        return new Response(JSON.stringify(isUpdated))

    } catch(err) {
        throw error(500, `A server error occurred while attempting to get update status of Graph: ${err}`)
    }
}