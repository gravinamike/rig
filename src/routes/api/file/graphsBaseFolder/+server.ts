import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import type { ServerConfig } from "$lib/shared/constants"
import fs from "fs"
import { graphsBaseFolderStore } from "$lib/stores/fileStores"




const serverConfigPath = "./static/config/serverconfig.json"



export const POST: RequestHandler = async () => {
    try {

        const serverConfigAsString = fs.readFileSync(serverConfigPath, "utf8")
        const serverConfig = JSON.parse(serverConfigAsString) as ServerConfig
        const graphsBaseFolder = serverConfig.graphsFolder

        graphsBaseFolderStore.set(graphsBaseFolder)
        
        return new Response(JSON.stringify(
            {
                message: `Base Graph folder set to ${graphsBaseFolder}.`
            }
        ))

    } catch(err) {
        throw error(500, `A server error occurred while attempting to set base Graphs folder.`)
    }
}