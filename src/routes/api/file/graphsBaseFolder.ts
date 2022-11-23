import type { ServerConfig } from "$lib/shared/constants"
import fs from "fs"
import { graphsBaseFolderStore } from "$lib/stores/fileStores"




const serverConfigPath = "./static/config/serverconfig.json"



export async function post(): Promise<{status: number, body: string | {error: string}}> {
    try {

        const serverConfigAsString = fs.readFileSync(serverConfigPath, "utf8")
        const serverConfig = JSON.parse(serverConfigAsString) as ServerConfig
        const graphsBaseFolder = serverConfig.graphsFolder

        graphsBaseFolderStore.set(graphsBaseFolder)
        
        return {
            status: 200,
            body: `Base Graph folder set to ${graphsBaseFolder}.`
        }

    } catch(err) {
        return {
            status: 500,
            body: { error: `A server error occurred while attempting to set base Graphs folder.`}
        }
    }
}