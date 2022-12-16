import { graphIsUpdated } from "$lib/db/serverSide/graphFile"


export async function get(): Promise<{
    status: number;
    body: boolean | { error: string }
}> {
    try {
        const isUpdated = await graphIsUpdated()

        return {
            status: 200,
            body: isUpdated
        }

    } catch(err) {
        return {
            status: 500,
            body: { error: `A server error occurred while attempting to get update status of Graph: ${err}`}
        }
    }
}