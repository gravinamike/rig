import { Space, getSpaces } from './graph';

let spaceIds: string | number[] | null;


export async function get({ params }: { params: { spaceIds: string } }): Promise<{ body: Space[] | null }> {
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
        body: spaces
    };
}