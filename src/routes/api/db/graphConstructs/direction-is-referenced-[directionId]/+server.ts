import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import { directionIsReferenced } from "$lib/server/db"


export const GET: RequestHandler = async ({ params }) => {
    try {
        const directionId = params.directionId || null

        const isReferenced =
            directionId ? await directionIsReferenced(Number(directionId)) :
            false

        return new Response(JSON.stringify(isReferenced))

    } catch(err) {
        throw error(500, `A server error occurred while attempting to determine if Direction is referenced: ${err}`)
    }
}