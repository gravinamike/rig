import path from "path"
import fs from "fs"
const fsPromises = fs.promises
import { initializeOrUpdateGraph } from "$lib/db/serverSide"
import { get } from "svelte/store"
import { graphsBaseFolderStore, unigraphFolderStore } from "$lib/stores"


export async function listAttachmentsFolder(
    folderGuid: string
): Promise<{ folderPath: string, folderContents: string[] }> {
    const graphsBaseFolder = get(graphsBaseFolderStore)
    const unigraphFolderName = get(unigraphFolderStore)
    const unigraphFolderPath = unigraphFolderName ?
        path.join(graphsBaseFolder, unigraphFolderName) :
        null

    if (unigraphFolderPath === null) return { folderPath: "NULL", folderContents: [] }

    const folderPath = path.join(unigraphFolderPath, "Folders", folderGuid)

    const folderContents = fs.readdirSync(folderPath)

    return {
        folderPath: folderPath,
        folderContents: folderContents
    }
}

export async function createFolder(folderGuid: string): Promise<void> {
    const graphsBaseFolder = get(graphsBaseFolderStore)
    const unigraphFolderName = get(unigraphFolderStore)
    const unigraphFolderPath = unigraphFolderName ?
        path.join(graphsBaseFolder, unigraphFolderName) :
        null

    if (unigraphFolderPath === null) return

    const folderPath = path.join(unigraphFolderPath, "Folders", folderGuid)

    fs.mkdirSync(folderPath)

    return
}


export async function listGraphsFolder(): Promise<string[]> {
    const graphsBaseFolder = get(graphsBaseFolderStore)
    const folderPath = path.join(graphsBaseFolder)

    const folderContents = fs.readdirSync(folderPath, { withFileTypes: true })
    const graphFolders = folderContents.filter( item => item.isDirectory() ).map( item => item.name )
    const validGraphFolders = graphFolders.filter( graphFolder => {
        const graphFolderPath = path.join(graphsBaseFolder, graphFolder)
        const graphFolderContents = fs.readdirSync(graphFolderPath)
        const graphFolderIsValid = (
            graphFolderContents.includes("graph.mv.db")
            && graphFolderContents.includes("config.json")
            && graphFolderContents.includes("Folders")
        ) ?
            true :
            false
        return graphFolderIsValid
    } )

    return validGraphFolders
}


export async function createNewGraphFile(folderName: string): Promise< void > {
    const graphsBaseFolder = get(graphsBaseFolderStore)
    const sourceGraphFilePath = "./static/templates/empty.mv.db"
    const destFolderPath = path.join(graphsBaseFolder, folderName)
    const destGraphFilePath = path.join(destFolderPath, "graph.mv.db")
    const destConfigFilePath = path.join(destFolderPath, "config.json")
    const destFoldersFolderPath = path.join(graphsBaseFolder, folderName, "Folders")
    
    await fsPromises.mkdir(destFolderPath)
    await fsPromises.mkdir(destFoldersFolderPath)
    await fsPromises.copyFile(sourceGraphFilePath, destGraphFilePath)
    await fsPromises.writeFile(
        destConfigFilePath,
        `{"readOnlyMode":false,"leftSideMenu":null,"rightSideMenu":null,"notesEditorLocked":null,"homeThingId":null,"pinIds":[1],"perspectiveThingId":1}`,
        "utf8"
    )

    await initializeOrUpdateGraph()
}