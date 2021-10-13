import { Space, getSpaces } from '$lib/shared/graph';

let spaceIds: string | number[]


export async function get(
    { params }: { params: {spaceIds: string} }
): Promise<{
    status: number;
    body: Space[] | { error: string }
}> {

    try {

        ({ spaceIds } = params)
        const spaces = spaceIds === "all" ? await getSpaces() : await getSpaces(spaceIds.split(",").map(x => Number(x)))
        
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