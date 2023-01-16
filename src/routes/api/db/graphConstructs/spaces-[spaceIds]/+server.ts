import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import { stripSpaceDbModels } from "$lib/models/dbModels/serverSide"
import { querySpaces } from "$lib/db/serverSide"



export const GET: RequestHandler = async ({ params }) => {
    try {
        const spaceIds = params.spaceIds || ""

        const rawSpaces = spaceIds === "all" ?
            await querySpaces(null) :
            await querySpaces(spaceIds.split(",").map(x => Number(x)))

        const spaces = stripSpaceDbModels(rawSpaces)

        return new Response(JSON.stringify(spaces))

    } catch(err) {
        throw error(500, `A server error occurred while attempting to get Spaces: ${err}`)
    }
}