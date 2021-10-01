import { Thing, getThings } from './graph';

let thingIds: string | number[];


export async function get({ params }: { params: { thingIds: string } }): Promise<{ body: Thing[] | null }> {
    ({ thingIds } = params);
    thingIds = thingIds.split(",").map(x => Number(x));
    const things: Thing[] = await getThings(thingIds);////////// Get a version that returns Thing, not Thing[]

    return {
        body: things
    };
}