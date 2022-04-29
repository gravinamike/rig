import path from "path"
import fs from "fs"
import { graphsBaseFolder, unigraphFolder } from "$lib/shared/constants"


export async function listAttachmentsFolder(folderGuid: string): Promise<string[]> {
    const folderPath = path.join(unigraphFolder, "Folders", folderGuid)

    const folderContents = fs.readdirSync(folderPath)

    return folderContents
}

export async function createFolder(folderGuid: string): Promise<void> {
    const folderPath = path.join(unigraphFolder, "Folders", folderGuid)

    fs.mkdirSync(folderPath)

    return
}


export async function listGraphsFolder(): Promise<string[]> {
    const folderPath = path.join(graphsBaseFolder)

    const folderContents = fs.readdirSync(folderPath, { withFileTypes: true })
    const graphFolders = folderContents.filter( item => item.isDirectory() ).map( item => item.name )
    const validGraphFolders = graphFolders.filter( graphFolder => {
        const graphFolderPath = path.join(graphsBaseFolder, graphFolder)
        const graphFolderContents = fs.readdirSync(graphFolderPath)
        const graphFolderIsValid = (
            graphFolderContents.includes("graph.mv.db")
            && graphFolderContents.includes("settings.ini")
            && graphFolderContents.includes("Folders")
        ) ?
            true :
            false
        return graphFolderIsValid
    } )

    return validGraphFolders
}