import { Thing, getThings } from './graph';

let thingId: string | number;


export async function get({ params }: { params: { thingId: string } }): Promise<{ body: Thing | null }> {
    ({ thingId } = params);
    thingId = Number(thingId);

    const thing = getThings(thingId);

    return {
        body: await thing
    };
}