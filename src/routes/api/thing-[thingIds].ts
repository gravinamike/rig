import { connectToDatabase } from "$lib/db"
import { Thing, getThings } from '$lib/graph';

let thingIds: string | number[];


export async function get({ params }: { params: { thingIds: string } }): Promise<{ status: number; body: Thing[] | { error: string } | null }> {
    ({ thingIds } = params);

    try {
        const Model = await connectToDatabase();

        ({ thingIds } = params);
        thingIds = thingIds.split(",").map(x => Number(x));
        const things: Thing[] = await getThings(thingIds);

        return {
            status: 200,
            body: things
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