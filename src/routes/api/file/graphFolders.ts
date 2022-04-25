import { listGraphsFolder } from "$lib/shared/fileSystem"


export async function get(): Promise<{
    status: number,
    body: string[] | { error: string }
}> {
    try {
        const folderListing = await listGraphsFolder()
        return {
            status: 200,
            body: folderListing
        }

    } catch(err) {
        return {
            status: 500,
            body: { error: `A server error occurred while attempting to get Graph folders listing: ${err}` }
        }
    }
}