import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import { stripDirectionDbModels } from "$lib/models/dbModels/serverSide"
import { queryDirections } from "$lib/db/serverSide"


export const GET: RequestHandler = async ({ params }) => {
    try {
        const directionIds = params.directionIds || ""

        const rawDirections = directionIds === "all" ?
            await queryDirections(null) :
            await queryDirections(directionIds.split(",").map(x => Number(x)))
        
        const directions = stripDirectionDbModels(rawDirections)

        return new Response(JSON.stringify(directions))

    } catch(err) {
        throw error(500, `A server error occurred while attempting to get Directions: ${err}`)
    }
}