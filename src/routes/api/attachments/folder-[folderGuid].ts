import { listFolder } from "$lib/shared/fileSystem"


let folderGuid: string

export async function get(
    { params }: { params: {folderGuid: string} }
): Promise<{
    status: number,
    body: string[] | { error: string }
}> {
    try {
        ({ folderGuid } = params)
        const folderListing = await listFolder(folderGuid)
        return {
            status: 200,
            body: folderListing
        }

    } catch(err) {
        return {
            status: 500,
            body: { error: `A server error occurred while attempting to get folder listing: ${err}` }
        }
    }
}