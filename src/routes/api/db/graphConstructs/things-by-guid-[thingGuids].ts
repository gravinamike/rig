import { Thing } from "$lib/models/constructModels"
import { queryThingsByGuid } from "$lib/db/serverSide"


export async function get(
    { params }: { params: { thingGuids: string } }
): Promise<{
    status: number;
    body: Thing[] | { error: string }
}> {
    let thingGuids: string | string[]

    try {
        ({ thingGuids } = params)
        const models = await queryThingsByGuid(thingGuids.split(","))

        const things: Thing[] = []
        for (const model of models) {
            things.push( new Thing(model) )
        }
        
        return {
            status: 200,
            body: things
        }

    } catch(err) {
        return {
            status: 500,
            body: { error: `A server error occurred while attempting to get Things: ${err}`}
        }
    }
}