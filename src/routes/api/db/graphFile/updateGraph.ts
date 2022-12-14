import { initializeOrUpdateGraph } from "$lib/db/serverSide/graphFile/initialize"


export async function post(): Promise<{status: number, body: string | {error: string}}> {
    try {
        await initializeOrUpdateGraph()
        
        return {
            status: 200,
            body: "Graph database updated successfully."
        }

    } catch(err) {
        return {
            status: 500,
            body: { error: `A server error occurred while attempting to update Graph database: ${err}`}
        }
    }
}