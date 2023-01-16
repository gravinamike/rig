import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import type { ServerConfig } from "$lib/shared/constants"
import fs from "fs"
import { dbPortStore } from "$lib/stores/fileStores"




const serverConfigPath = "./static/config/serverconfig.json"


export const POST: RequestHandler = async () => {
    try {

        const serverConfigAsString = fs.readFileSync(serverConfigPath, "utf8")
        const serverConfig = JSON.parse(serverConfigAsString) as ServerConfig
        const dbPort = serverConfig.dbPort

        dbPortStore.set(dbPort)
        
        return new Response(JSON.stringify(
            {
                message: `Database listening port set to ${dbPort}.`
            }
        ))

    } catch(err) {
        throw error(500, `A server error occurred while attempting to set database listening port.`)
    }
}