import type { Space } from "$lib/models/dbModels"
import { querySpaces } from "$lib/db/serverSide"


let spaceIds: string | number[]

export async function get(
    { params }: { params: {spaceIds: string} }
): Promise<{
    status: number;
    body: Space[] | { error: string }
}> {
    try {
        ({ spaceIds } = params)
        const spaces = spaceIds === "all" ? await querySpaces(null) : await querySpaces(spaceIds.split(",").map(x => Number(x)))
        return {
            status: 200,
            body: spaces
        }

    } catch(err) {
        return {
            status: 500,
            body: { error: `A server error occurred while attempting to get Spaces: ${err}` }
        }
    }
}