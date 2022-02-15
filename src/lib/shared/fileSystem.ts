import path from "path"
import fs from "fs"
import { unigraphFolder } from "$lib/shared/constants"


export async function listFolder(folderGuid: string): Promise<string[]> {
    const folderPath = path.join(unigraphFolder, "Folders", folderGuid)

    const folderContents = fs.readdirSync(folderPath)

    return folderContents
}

export async function createFolder(folderGuid: string): Promise<void> {
    const folderPath = path.join(unigraphFolder, "Folders", folderGuid)

    fs.mkdirSync(folderPath)

    return
}