import fs from "fs"
import type { Config } from "$lib/shared/constants"


const configPath = "./static/config.json"


export async function get(
    { params }: { params: {directionIds: string} }
): Promise<{
    status: number;
    body: Config | { error: string }
}> {
    try {
        const configAsString = fs.readFileSync(configPath, "utf8")
        const config = JSON.parse(configAsString) as Config

        return {
            status: 200,
            body: config
        }

    } catch(err) {
        return {
            status: 500,
            body: {
                error: `A server error occurred while attempting to get Directions: ${err}`
            }
        }
    }
}


export async function post(
    request: any
): Promise<{
    status: number;
    body: { message: string } | { error: string }
}> {
    try {
        fs.writeFile(configPath, request.body, function (err) {
            if (err) {
                console.log(`Error saving configuration: ${err.message}`)
                return
            }
        })

        console.log(`Configuration saved.`)
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