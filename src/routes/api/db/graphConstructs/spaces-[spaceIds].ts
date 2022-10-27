import { stripSpaceDbModels } from "$lib/models/dbModels/serverSide"
import { querySpaces } from "$lib/db/serverSide"
import type { SpaceDbModel } from "$lib/models/dbModels/clientSide"


let spaceIds: string | number[]

export async function get(
    { params }: { params: {spaceIds: string} }
): Promise<{
    status: number;
    body: SpaceDbModel[] | { error: string }
}> {
    try {
        ({ spaceIds } = params)
        const rawSpaces = spaceIds === "all" ?
            await querySpaces(null) :
            await querySpaces(spaceIds.split(",").map(x => Number(x)))

        const spaces = stripSpaceDbModels(rawSpaces)

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