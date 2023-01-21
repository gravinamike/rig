import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import path from "path"
import fs from "fs"
import type { GraphConfig } from "$lib/shared/constants"
import { graphsBaseFolderStore } from "$lib/stores"
import { get as getStore } from "svelte/store"
import { retrieveSessionSpecificCookie } from "$lib/db/utility/sessionSpecificFetch"


export const GET: RequestHandler = async ({ request }) => {
    try {

        const graphName = retrieveSessionSpecificCookie(request, "graphName")


        const graphsBaseFolder = getStore(graphsBaseFolderStore)

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


export const POST: RequestHandler = async ({ request }) => {
    try {

        const graphName = retrieveSessionSpecificCookie(request, "graphName")


        const graphsBaseFolder = getStore(graphsBaseFolderStore)
        const body = await request.json()
        const graphConfigPath = `${graphsBaseFolder}/${graphName}/config.json`
        fs.writeFile(graphConfigPath, JSON.stringify(body), function (err) {
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