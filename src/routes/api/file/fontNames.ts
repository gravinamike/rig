import fs from "fs"


const fontNamesPath = "./static/customizable/font-names.json"


export async function get(): Promise<{
    status: number;
    body: string[] | { error: string }
}> {
    try {
        const graphConfigAsString = fs.readFileSync(fontNamesPath, "utf8")
        const fontNames = JSON.parse(graphConfigAsString) as string[]

        return {
            status: 200,
            body: fontNames
        }

    } catch(err) {
        return {
            status: 500,
            body: {
                error: `A server error occurred while attempting to get font names: ${err}`
            }
        }
    }
}