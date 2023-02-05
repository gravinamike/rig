import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import fs from "fs"
import type { AppConfig } from "$lib/shared/constants"
import { get as getStore } from "svelte/store"
import { unigraphFolderStore } from "$lib/stores/fileStores"


const configPath = "./static/config/config.json"


export const GET: RequestHandler = async () => {
    try {
        const configAsString = fs.readFileSync(configPath, "utf8")
        const config = JSON.parse(configAsString) as AppConfig

        return new Response(JSON.stringify(config))

    } catch(err) {
        throw error(500, `A server error occurred while attempting to get application config: ${err}`)
    }
}


export const POST: RequestHandler = async () => {
    try {
        const unigraphFolderStoreValue = getStore(unigraphFolderStore)

        const appConfig = {
            unigraphFolder: unigraphFolderStoreValue
        }


        fs.writeFile(configPath, JSON.stringify(appConfig, null, 2), function (err) {
            if (err) {
                console.log(`Error saving app configuration: ${err.message}`)
                return
            }
        })

        return new Response(JSON.stringify(
            {
                message: `Configuration saved.`
            }
        ))

    } catch (err) {
        console.log(`An error occurred while saving configuration: ${err}`)
        throw error(500, `An error occurred while saving configuration: ${err}`)
    }
}