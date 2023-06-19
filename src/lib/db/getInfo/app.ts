// Import types.
import type { AppConfig, GraphConfig } from "$lib/shared/constants"

// Import session-specific fetch.
import { sessionSpecificFetch as fetch } from "$lib/db/sessionSpecificFetch"



/*
 * Get the app configuration.
 */
export async function getAppConfig(): Promise<AppConfig | false> {
    const res = await fetch("/api/file/appConfig")

    // If the response is ok,
    if (res.ok) {
        const appConfig = await res.json() as AppConfig
        return appConfig

    // Handle errors if needed.
    } else {
        res.text().then(text => {throw Error(text)})
        return false
    }
}

/*
 * Get the Graph configuration.
 */
export async function getGraphConfig(): Promise<GraphConfig | false> {
    const res = await fetch("/api/file/graphConfig")

    // If the response is ok,
    if (res.ok) {
        const graphConfig = await res.json()

        // If the config is from an older version that doesn't contain certain
        // keys, add these keys.
        if (!("readOnlyMode" in graphConfig)) graphConfig["readOnlyMode"] = false
        if (!("hideMenus" in graphConfig)) graphConfig["hideMenus"] = []
        if (!("leftSideMenu" in graphConfig)) graphConfig["leftSideMenu"] = null
        if (!("rightSideMenu" in graphConfig)) graphConfig["rightSideMenu"] = null
        if (!("notesEditorLocked" in graphConfig)) graphConfig["notesEditorLocked"] = null
        if (!("homeThingId" in graphConfig)) graphConfig["homeThingId"] = null

        return graphConfig as GraphConfig

    // Handle errors if needed.
    } else {
        res.text().then(text => {throw Error(text)})
        return false
    }
}


/*
 * Get list of font names.
 */
export async function getFontNames(): Promise<string[] | false> {
    const res = await fetch("/api/file/fontNames")

    // If the response is ok,
    if (res.ok) {
        const fontNames = await res.json() as string[]
        return fontNames

    // Handle errors if needed.
    } else {
        res.text().then(text => {throw Error(text)})
        return false
    }
}