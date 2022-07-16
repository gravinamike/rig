import fs from "fs"
import type { AppConfig } from "$lib/shared/constants"
import { get as getStore } from "svelte/store"
import { unigraphFolderStore } from "$lib/stores/fileStores"


const configPath = "./static/config/config.json"


export async function get(): Promise<{
    status: number;
    body: AppConfig | { error: string }
}> {
    try {
        const configAsString = fs.readFileSync(configPath, "utf8")
        const config = JSON.parse(configAsString) as AppConfig

        return {
            status: 200,
            body: config
        }

    } catch(err) {
        return {
            status: 500,
            body: {
                error: `A server error occurred while attempting to get application config: ${err}`
            }
        }
    }
}


export async function post(): Promise<{
    status: number;
    body: { message: string } | { error: string }
}> {
    try {
        const unigraphFolderStoreValue = getStore(unigraphFolderStore)

        const appConfig = {
            unigraphFolder: unigraphFolderStoreValue
        }


        fs.writeFile(configPath, JSON.stringify(appConfig), function (err) {
            if (err) {
                console.log(`Error saving configuration: ${err.message}`)
                return
            }
        })

        return {
            status: 200,
            body: {
                message: `Configuration saved.`
            }
        }

    } catch (error) {
        console.log(`An error occurred while saving configuration: ${error}`)
        return {
            status: 500,
            body: {
                error: `An error occurred while saving configuration: ${error}`
            }
        }
    }
}