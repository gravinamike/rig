import { stripDirectionDbModels } from "$lib/models/dbModels/serverSide"
import { queryDirections } from "$lib/db/serverSide"
import type { DirectionDbModel } from "$lib/models/dbModels/clientSide"


let directionIds: string | number[]

export async function get(
    { params }: { params: {directionIds: string} }
): Promise<{
    status: number;
    body: DirectionDbModel[] | { error: string }
}> {
    try {
        ({ directionIds } = params)
        const rawDirections = directionIds === "all" ?
            await queryDirections(null) :
            await queryDirections(directionIds.split(",").map(x => Number(x)))
        
        const directions = stripDirectionDbModels(rawDirections)

        return {
            status: 200,
            body: directions
        }

    } catch(err) {
        return {
            status: 500,
            body: { error: `A server error occurred while attempting to get Directions: ${err}` }
        }
    }
}