import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import { queryThingSearchList } from "$lib/server/db"


export const GET: RequestHandler = async ({ params }) => {
    try {
        const thingIds = params.thingIds || ""

        const thingSearchList = thingIds === "all" ?
            await queryThingSearchList(null) :
            await queryThingSearchList(thingIds.split(",").map(x => Number(x)))
            
        return new Response(JSON.stringify(thingSearchList))

    } catch(err) {
        throw error(500, `A server error occurred while attempting to get Thing search list: ${err}`)
    }
}