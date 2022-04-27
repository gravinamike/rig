import fs from "fs"
import type { AppConfig } from "$lib/shared/constants"


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


export async function post(
    {request}: {request: Request}
): Promise<{
    status: number;
    body: { message: string } | { error: string }
}> {
    try {
        const body = await request.json()
        fs.writeFile(configPath, JSON.stringify(body), function (err) {
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