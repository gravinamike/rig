import path from "path"
import fs from "fs"
const fsPromises = fs.promises
import { initializeOrUpdateGraph } from "$lib/server/db"
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


export async function listGraphFolderForUsername(username: string): Promise<string[]> {
    const graphsBaseFolder = get(graphsBaseFolderStore)
    const folderPath = path.join(graphsBaseFolder, username)
    
    const folderContents = fs.readdirSync(folderPath, { withFileTypes: true })
    const graphFolders = folderContents.filter( item => item.isDirectory() ).map( item => item.name )
    const validGraphFolders = graphFolders.filter( graphFolder => {
        const graphFolderPath = path.join(graphsBaseFolder, username, graphFolder)
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


export async function createNewGraphFile(username: string | null, folderName: string): Promise< void > {
    const graphsBaseFolder = get(graphsBaseFolderStore)
    const sourceGraphFilePath = "./static/templates/empty.mv.db"
    const destUserFolderPath = path.join(graphsBaseFolder, username || "all")
    const destFolderPath = path.join(destUserFolderPath, folderName)
    const destGraphFilePath = path.join(destFolderPath, "graph.mv.db")
    const destConfigFilePath = path.join(destFolderPath, "config.json")
    const destFoldersFolderPath = path.join(destFolderPath, "Folders")
    
    if (!fs.existsSync(destUserFolderPath)) await fsPromises.mkdir(destUserFolderPath)
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





export async function createUserFolder(username: string): Promise<void> {
    const graphsBaseFolder = get(graphsBaseFolderStore)

    const userFolderPath = path.join(graphsBaseFolder, username)

    if (!fs.existsSync(userFolderPath)) fs.mkdirSync(userFolderPath)

    return
}