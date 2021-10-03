import { connectToDatabase } from "$lib/db"
import { Space, getSpaces } from '$lib/graph';

let spaceIds: string | number[] | null;


export async function get({ params }: { params: { spaceIds: string } }): Promise<{ status: number; body: Space[] | { error: string } | null }> {

    try {
        const Model = await connectToDatabase();

        ({ spaceIds } = params);
        let spaces: Space[];
        if (spaceIds === "all") {
            spaceIds = null;
            spaces = await getSpaces(spaceIds);
        } else {
            spaceIds = spaceIds.split(",").map(x => Number(x));
            spaces = await getSpaces(spaceIds);
        }

        return {
            status: 200,
            body: spaces
        };
    } catch(err) {
        return {
            status: 500,
            body: {
                error: 'A server error occurred.'
            }
        }
    }
}