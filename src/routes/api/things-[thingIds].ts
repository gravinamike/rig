import { Thing, queryThings} from "$lib/shared/graph/dbConstructs"


export async function get(
    { params }: { params: { thingIds: string } }
): Promise<{
    status: number;
    body: Thing[] | { error: string }
}> {
    let thingIds: string | number[]

    try {
        ({ thingIds } = params)
        const things = await queryThings(thingIds.split(",").map(x => Number(x)))
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