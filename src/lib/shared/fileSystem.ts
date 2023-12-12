// Import types.
import type { ServerConfig } from "./constants"

// Import SvelteKit framework resources.
import { get } from "svelte/store"

// Import file-related resources.
import path from "path"
import fs from "fs"
const fsPromises = fs.promises

// Import stores.
import { graphsBaseFolderStore, unigraphFolderStore } from "$lib/stores"

// Import API methods.
import { initializeOrUpdateGraph } from "$lib/server/db"



/**
 * Create-log-folder-and-file-if-needed method.
 * 
 * If there is not yet a log folder and log file, creates them.
 */
export async function createLogFolderAndFileIfNeeded(): Promise<void> {
    // Get the path for the logs folder.
    const serverConfigPath = "./static/config/serverconfig.json"
    const serverConfigAsString = fs.readFileSync(serverConfigPath, "utf8")
    const serverConfig = JSON.parse(serverConfigAsString) as ServerConfig
    const logsFolderPath = serverConfig.logsFolder

    // If no log-file logging was specified, abort with a message.
    if (logsFolderPath === null) {
        console.log("No log file path specified. Not saving logs to log file.")
        return
    }

    
    // Create the logs folder if it doesn't exist.
    if (!fs.existsSync(logsFolderPath)) fs.mkdirSync(logsFolderPath)

    // Create the logs file if it doesn't exist.
    const sourceLogFilePath = "./static/templates/empty.log"
    const logFilePath = `${logsFolderPath}/rig_log.log`
    if (!fs.existsSync(logFilePath)) await fsPromises.copyFile(sourceLogFilePath, logFilePath)
}


/**
 * Create-attachments-folder method.
 * 
 * Create an attachments folder based on a supplied GUID.
 * @param folderGuid - The GUID of the to-be-created folder.
 */
export async function createAttachmentsFolder(folderGuid: string): Promise<void> {
    // Get the path to the Graph's root folder.
    const graphsBaseFolder = get(graphsBaseFolderStore)
    const unigraphFolderName = get(unigraphFolderStore)
    const unigraphFolderPath = unigraphFolderName ?
        path.join(graphsBaseFolder, unigraphFolderName) :
        null

    // If that path is null, abort.
    if (unigraphFolderPath === null) return

    // Get the path for the to-be-created attachments folder.
    const folderPath = path.join(unigraphFolderPath, "Folders", folderGuid)

    // Create that folder.
    fs.mkdirSync(folderPath)
}

/**
 * List-attachments-folder method.
 * 
 * Gets an object describing the path and contents of an attachments folder.
 * @param folderGuid - The GUID of the attachments folder.
 * @returns - An object describing the path and contents of the folder.
 */
export async function listAttachmentsFolder(
    folderGuid: string
): Promise<
    { folderPath: string, folderContents: string[] }
> {
    // Get the path to the Graph's root folder.
    const graphsBaseFolder = get(graphsBaseFolderStore)
    const unigraphFolderName = get(unigraphFolderStore)
    const unigraphFolderPath = unigraphFolderName ?
        path.join(graphsBaseFolder, unigraphFolderName) :
        null

    // If that path is null, return an empty list.
    if (unigraphFolderPath === null) return { folderPath: "NULL", folderContents: [] }

    // Get the path to the specified attachments folder.
    const folderPath = path.join(unigraphFolderPath, "Folders", folderGuid)

    // List the files in the folder.
    const folderContents = fs.readdirSync(folderPath)

    // Return an object describing the path and contents of the folder.
    return {
        folderPath: folderPath,
        folderContents: folderContents
    }
}


/**
 * Create-user-folder method.
 * 
 * Creates the Graphs folder for a specified username.
 * @param username - The username to create the folder for.
 */
export async function createUserFolder(username: string): Promise<void> {
    // Get the path for the username's Graphs folder.
    const graphsBaseFolder = get(graphsBaseFolderStore)
    const userFolderPath = path.join(graphsBaseFolder, username)

    // If that folder doesn't exist, create it.
    if (!fs.existsSync(userFolderPath)) fs.mkdirSync(userFolderPath)
}

/**
 * List-Graphs-folder-for-username method.
 * 
 * Creates an array of Graph folder names associated with a given username.
 * @param username - The username to list Graph folder names for.
 * @returns - An array of associated Graph folder names.
 */
export async function listGraphFolderForUsername(username: string): Promise<string[]> {
    // Get the path of the user's Graphs folder.
    const graphsBaseFolder = get(graphsBaseFolderStore)
    const folderPath = path.join(graphsBaseFolder, username)
    
    // Get an array of names of valid Graph folders in that folder (where valid means that they
    // contain the correct subfolders and files).
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

    // Return that array.
    return validGraphFolders
}

/**
 * Create-new-Graph-file method.
 * 
 * Create a new Graph file with a specified name for a specified user.
 * @param username - The username to create the new Graph file for.
 * @param folderName - The name for the new Graph folder.
 */
export async function createNewGraphFile(username: string | null, folderName: string): Promise< void > {
    // Get information related to file paths.
    const graphsBaseFolder = get(graphsBaseFolderStore)
    const sourceGraphFilePath = "./static/templates/empty.mv.db"
    const destUserFolderPath = path.join(graphsBaseFolder, username || "all")
    const destFolderPath = path.join(destUserFolderPath, folderName)
    const destGraphFilePath = path.join(destFolderPath, "graph.mv.db")
    const destConfigFilePath = path.join(destFolderPath, "config.json")
    const destFoldersFolderPath = path.join(destFolderPath, "Folders")
    
    // If the user's Graphs folder doesn't exist yet, create it.
    if (!fs.existsSync(destUserFolderPath)) await fsPromises.mkdir(destUserFolderPath)

    // Create the new Graph file folder.
    await fsPromises.mkdir(destFolderPath)

    // Creat the attachments-folders subfolder.
    await fsPromises.mkdir(destFoldersFolderPath)

    // Copy the Graph database file from the template.
    await fsPromises.copyFile(sourceGraphFilePath, destGraphFilePath)

    // Create the config file.
    await fsPromises.writeFile(
        destConfigFilePath,
        `{"readOnlyMode":false,"leftSideMenu":null,"rightSideMenu":null,"notesEditorLocked":null,"homeThingId":null,"pinIds":[1],"perspectiveThingId":1}`,
        "utf8"
    )

    // Initialize the new Graph file.
    await initializeOrUpdateGraph()
}