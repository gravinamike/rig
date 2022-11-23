import path from "path"
import fs from "fs"
import type { GraphConfig } from "$lib/shared/constants"
import { graphsBaseFolderStore, unigraphFolderStore } from "$lib/stores"
import { get as getStore } from "svelte/store"


export async function get(): Promise<{
    status: number;
    body: GraphConfig | { error: string }
}> {
    try {
        const graphsBaseFolder = getStore(graphsBaseFolderStore)
        const unigraphFolderStoreValue = getStore(unigraphFolderStore)

        const graphConfigPath = unigraphFolderStoreValue ?
            path.join(graphsBaseFolder, unigraphFolderStoreValue, "config.json") :
            null

        if (graphConfigPath) {

            const graphConfigAsString = fs.readFileSync(graphConfigPath, "utf8")
            const graphConfig = JSON.parse(graphConfigAsString) as GraphConfig

            return {
                status: 200,
                body: graphConfig
            }
            
        } else {

            return {
                status: 500,
                body: {
                    error: `Can't get configuration file when no Graph is open.`
                }
            }

        }

    } catch(err) {
        return {
            status: 500,
            body: {
                error: `A server error occurred while attempting to get configuration file: ${err}`
            }
        }
    }
}


export async function post(
    {request}: {request: Request}
): Promise<{
    status: number;
    body: { message: string } | { error: string }
}> {
    try {
        const graphsBaseFolder = getStore(graphsBaseFolderStore)
        const body = await request.json()
        const graphConfigPath = `${graphsBaseFolder}/${getStore(unigraphFolderStore)}/config.json`
        fs.writeFile(graphConfigPath, JSON.stringify(body), function (err) {
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