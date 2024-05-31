// Import types.
import type { AppConfig, GraphConfig } from "$lib/shared/constants"

// Import session-specific fetch.
import { sessionSpecificFetch as fetch } from "$lib/db/sessionSpecificFetch"



/**
 * Get-app-configuration method.
 * 
 * Retrieves an object defining the app's current configuration from the back-
 * end API.
 * @returns - The app configuration object.
 */
export async function getAppConfig(): Promise<AppConfig | false> {
    // Query the app-configuration API.
    const res = await fetch("/api/file/appConfig")

    // If the response is ok,
    if (res.ok) {
        // Parse and return the app config object.
        const appConfig = await res.json() as AppConfig
        return appConfig

    // Handle errors if needed.
    } else {
        res.text().then(text => {throw Error(text)})
        return false
    }
}

/**
 * Get-Graph-configuration method.
 * 
 * Retrieves an object defining the Graph's current configuration from the
 * back-end API.
 * @returns - The Graph configuration object.
 */
export async function getGraphConfig(): Promise<GraphConfig | false> {
    // Query the Graph-configuration API.
    const res = await fetch("/api/file/graphConfig")

    // If the response is ok,
    if (res.ok) {
        // Parse the Graph configuration object.
        const graphConfig = await res.json()

        // If the config is from an older version that doesn't contain certain
        // keys, add these keys.
        if (!("readOnlyMode" in graphConfig)) graphConfig["readOnlyMode"] = false
        if (!("canEdit" in graphConfig)) graphConfig["canEdit"] = ["all"]
        if (!("hideMenus" in graphConfig)) graphConfig["hideMenus"] = []
        if (!("leftSideMenu" in graphConfig)) graphConfig["leftSideMenu"] = null
        if (!("rightSideMenu" in graphConfig)) graphConfig["rightSideMenu"] = null
        if (!("notesEditorLocked" in graphConfig)) graphConfig["notesEditorLocked"] = null
        if (!("homeThingId" in graphConfig)) graphConfig["homeThingId"] = null

        // Return the Graph configuration object.
        return graphConfig as GraphConfig

    // Handle errors if needed.
    } else {
        res.text().then(text => {throw Error(text)})
        return false
    }
}


/**
 * Get-font-names method.
 * 
 * Retrieves an array of the names of available fonts from the back-end API.
 * @returns - Array of font names.
 */
export async function getFontNames(): Promise<string[] | false> {
    // Query the font-names API.
    const res = await fetch("/api/file/fontNames")

    // If the response is ok,
    if (res.ok) {
        // Parse and return the array of font names.
        const fontNames = await res.json() as string[]
        return fontNames

    // Handle errors if needed.
    } else {
        res.text().then(text => {throw Error(text)})
        return false
    }
}