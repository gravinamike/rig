import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import { spaceIsReferenced } from "$lib/db/serverSide"


export const GET: RequestHandler = async ({ params }) => {
    try {
        const spaceId = params.spaceId || null

        const isReferenced =
            spaceId ? await spaceIsReferenced(Number(spaceId)) :
            false

        return new Response(JSON.stringify(isReferenced))

    } catch(err) {
        throw error(500, `A server error occurred while attempting to determine if Space is referenced: ${err}`)
    }
}