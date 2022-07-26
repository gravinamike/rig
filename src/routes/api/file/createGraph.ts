import { createNewGraphFile } from "$lib/shared/fileSystem"


export async function post(
    {request}: {request: Request}
): Promise<{status: number, body: string | {error: string}}> {
    try {
        const body = await request.json()
        await createNewGraphFile(body.newGraphName)
        
        return {
            status: 200,
            body: "New Graph file created."
        }

    } catch(err) {
        return {
            status: 500,
            body: { error: `A server error occurred while attempting to create new Graph file: ${err}`}
        }
    }
}