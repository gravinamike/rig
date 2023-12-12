import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import { Thing } from "$lib/models/constructModels"
import { queryThingsByGuid } from "$lib/server/db"


export const GET: RequestHandler = async ({ params }) => {
    try {
        const thingGuids = params.thingGuids || ""
        const models = await queryThingsByGuid(thingGuids.split(","))

        const things: Thing[] = []
        for (const model of models) {
            things.push( new Thing(model) )
        }
        
        return new Response(JSON.stringify(things))

    } catch(err) {
        throw error(500, `A server error occurred while attempting to get Things: ${err}`)
    }
}