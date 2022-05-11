import type { DirectionDbModel } from "$lib/models/dbModels"
import { queryDirections } from "$lib/db/serverSide"


let directionIds: string | number[]

export async function get(
    { params }: { params: {directionIds: string} }
): Promise<{
    status: number;
    body: DirectionDbModel[] | { error: string }
}> {
    try {
        ({ directionIds } = params)
        const directions = directionIds === "all" ? await queryDirections(null) : await queryDirections(directionIds.split(",").map(x => Number(x)))
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