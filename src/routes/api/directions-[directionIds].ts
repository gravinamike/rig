import type { Direction } from "$lib/shared/graph/constructs/direction"
import { queryDirections } from "$lib/shared/graph/constructs/query"


let directionIds: string | number[]

export async function get(
    { params }: { params: {directionIds: string} }
): Promise<{
    status: number;
    body: Direction[] | { error: string }
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