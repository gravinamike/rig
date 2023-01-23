import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import fs from "fs"


const fontNamesPath = "./static/customizable/font-names.json"


export const GET: RequestHandler = async () => {
    try {
        const graphConfigAsString = fs.readFileSync(fontNamesPath, "utf8")
        const fontNames = JSON.parse(graphConfigAsString) as string[]

        return new Response(JSON.stringify(fontNames))

    } catch(err) {
        throw error(500, `A server error occurred while attempting to get font names: ${err}`)
    }
}