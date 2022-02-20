import type { LatestConstructInfos } from "$lib/db/serverSide"
import { getLatestConstructs } from "$lib/db/serverSide"


export async function get(): Promise<{
    status: number;
    body: LatestConstructInfos | { error: string }
}> {
    try {
        const latestConstructs = await getLatestConstructs()
        return {
            status: 200,
            body: latestConstructs
        }

    } catch(err) {
        return {
            status: 500,
            body: { error: `A server error occurred while attempting to get latest database Constructs: ${err}` }
        }
    }
}