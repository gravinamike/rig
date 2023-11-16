// Import types.
import type { RequestHandler } from "@sveltejs/kit"
import type { GraphConfig } from "$lib/shared/constants"

// Import SvelteKit framework resources.
import { error } from "@sveltejs/kit"
import { get as getStore } from "svelte/store"

// Import file-related resources.
import path from "path"
import fs from "fs"

// Import stores.
import { graphsBaseFolderStore } from "$lib/stores"

// Import cookie-related methods.
import { retrieveSessionSpecificCookie } from "$lib/db/sessionSpecificFetch"


export const GET: RequestHandler = async ({ request, params }) => {
    try {
        const graphsBaseFolder = getStore(graphsBaseFolderStore)

        const sessionUuid = params.sessionUuid as string
        const graphName = retrieveSessionSpecificCookie(sessionUuid, request, "graphName")

        const graphConfigPath = graphName ?
            path.join(graphsBaseFolder, graphName, "config.json") :
            null

        if (graphConfigPath) {
            const graphConfigAsString = fs.readFileSync(graphConfigPath, "utf8")
            const graphConfig = JSON.parse(graphConfigAsString) as GraphConfig
            return new Response(JSON.stringify(graphConfig))
            
        } else {
            throw error(500, `Can't get configuration file when no Graph is open.`)
        }

    } catch(err) {
        throw error(500, `A server error occurred while attempting to get configuration file: ${err}`)
    }
}


export const POST: RequestHandler = async ({ request, params }) => {
    try {
        const graphsBaseFolder = getStore(graphsBaseFolderStore)

        const sessionUuid = params.sessionUuid as string
        const graphName = retrieveSessionSpecificCookie(sessionUuid, request, "graphName")

        const graphConfigPath = `${graphsBaseFolder}/${graphName}/config.json`

        const body = await request.json()

        fs.writeFile(graphConfigPath, JSON.stringify(body, null, 2), function (err) {
            if (err) {
                console.log(`Error saving Graph configuration: ${err.message}`)
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