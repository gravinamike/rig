import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import { stripThingDbModels } from "$lib/models/dbModels/serverSide"
import { queryThings } from "$lib/server/db"



export const GET: RequestHandler = async ({ params }) => {
    try {
        const thingIds = params.thingIds || ""

        const rawThings = await queryThings(thingIds.split(",").map(x => Number(x)))

        const things = stripThingDbModels(rawThings)

        return new Response(JSON.stringify(things))

    } catch(err) {
        throw error(500, `A server error occurred while attempting to get Things: ${err}`)
    }
}