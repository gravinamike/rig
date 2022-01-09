import { createNewRelatedThing } from "$lib/shared/graph/constructs/query"


export async function get(
    { params }: { params: { thingIdToRelateFrom: number } }
): Promise<{
    status: number;
    body: string | { error: string }
}> {
    let thingIdToRelateFrom: number

    try {
        ({ thingIdToRelateFrom } = params)
        await createNewRelatedThing(thingIdToRelateFrom)
        return {
            status: 200,
            body: "New related Thing created successfully."
        }

    } catch(err) {
        return {
            status: 500,
            body: { error: `A server error occurred while attempting to create new related Thing: ${err}`}
        }
    }
}