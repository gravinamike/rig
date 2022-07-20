import path from "path"
import fs from "fs"
const fsPromises = fs.promises
import { graphsBaseFolder, unigraphFolder } from "$lib/shared/constants"
import { initializeNewGraph } from "$lib/db/serverSide"


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


export async function createNewGraphFile(folderName: string): Promise< void > {
    const sourceGraphFilePath = "./static/templates/empty.mv.db"
    const destFolderPath = path.join(graphsBaseFolder, folderName)
    const destGraphFilePath = path.join(destFolderPath, "graph.mv.db")
    const destConfigFilePath = path.join(destFolderPath, "config.json")
    const destFoldersFolderPath = path.join(graphsBaseFolder, folderName, "Folders")
    
    await fsPromises.mkdir(destFolderPath)
    await fsPromises.mkdir(destFoldersFolderPath)
    await fsPromises.copyFile(sourceGraphFilePath, destGraphFilePath)
    const configHandle = await fsPromises.open(destConfigFilePath, 'w')
    await configHandle.close()

    await initializeNewGraph()
}