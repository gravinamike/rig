// Import types.
import { defaultUIBackgroundColor, defaultUITrimColor, type AppConfig, type GraphConfig } from "$lib/shared/constants"

// Import basic framework resources.
import { get } from "svelte/store"

// Import stores.
import {
    readOnlyMode as readOnlyModeStore, perspectiveThingIdStore, leftSideMenuStore, rightSideMenuStore, notesEditorLockedStore,
    homeThingIdStore, pinIdsStore, uIBackgroundColorStore, uITrimColorStore, graphBackgroundImageStore, notesBackgroundImageStore, hideMenusStore
} from "$lib/stores"

// Import API methods.
import { getAppConfig, getGraphConfig } from "$lib/db/clientSide/getInfo"
import {
    setDbPort, setGraphsBaseFolder, saveAppConfig as apiSaveAppConfig, saveGraphConfig as apiSaveGraphConfig
} from "$lib/db/clientSide/makeChanges"
import { stringRepresentsHexColor } from "./utility"


/**
 * Store-app-config method.
 * 
 * Loads configuration-related values from the JSON config file.
 */
export async function storeAppConfig(): Promise<AppConfig> {
    // Retrieve the app config from the JSON config file.
    const appConfig = await getAppConfig() as AppConfig

    // Set the back-end stores.
    await setDbPort()
    await setGraphsBaseFolder()

    return appConfig
}

/**
 * Store-Graph-config method.
 * 
 * Loads configuration-related values from the JSON config file. Gives option
 * to force overwrite of Perspective Thing ID parameter.
 * @param pThingId - The Perspective Thing ID, if any, to overwrite in the config.
 */
export async function storeGraphConfig(pThingId: number | null = null): Promise<void> {
    // Retrieve the graph config from the JSON config file.
    const graphConfig = await getGraphConfig() as GraphConfig

    // Set front-end stores.
    uITrimColorStore.set(
        graphConfig.uITrimColor && stringRepresentsHexColor(graphConfig.uITrimColor) ? graphConfig.uITrimColor :
        defaultUITrimColor
    )
    uIBackgroundColorStore.set(
        graphConfig.uIBackgroundColor && stringRepresentsHexColor(graphConfig.uIBackgroundColor) ? graphConfig.uIBackgroundColor :
        defaultUIBackgroundColor
    )
    graphBackgroundImageStore.set(
        graphConfig.graphBackgroundImage || null
    )
    notesBackgroundImageStore.set(
        graphConfig.notesBackgroundImage || null
    )
    readOnlyModeStore.set(graphConfig.readOnlyMode)
    hideMenusStore.set(graphConfig.hideMenus)
    leftSideMenuStore.set(graphConfig.leftSideMenu)
    rightSideMenuStore.set(graphConfig.rightSideMenu)
    notesEditorLockedStore.set(graphConfig.notesEditorLocked)
    homeThingIdStore.set(graphConfig.homeThingId)
    pinIdsStore.set(graphConfig.pinIds)
    perspectiveThingIdStore.set(
        graphConfig.homeThingId ? graphConfig.homeThingId :
        graphConfig.perspectiveThingId
    )

    // Overwrite Perspective Thing ID store if required.
    if (pThingId) perspectiveThingIdStore.set(pThingId)
}

/**
 * Save-app-config method.
 * 
 * Saves application config to file.
 */
export async function saveAppConfig(): Promise<void> {
    await apiSaveAppConfig()
}

/**
 * Save-Graph-config method.
 * 
 * Saves Graph config to file.
 */
export async function saveGraphConfig(): Promise<void> {
    // Retrieve config info from the stores.
    const uITrimColor = get(uITrimColorStore)
    const uIBackgroundColor = get(uIBackgroundColorStore)
    const graphBackgroundImage = get(graphBackgroundImageStore)
    const notesBackgroundImage = get(notesBackgroundImageStore)
    const readOnlyMode = get(readOnlyModeStore)
    const hideMenus = get(hideMenusStore)
    const leftSideMenu = get(leftSideMenuStore)
    const rightSideMenu = get(rightSideMenuStore)
    const notesEditorLocked = get(notesEditorLockedStore)
    const homeThingId = get(homeThingIdStore)
    const pinIdsStoreValue = get(pinIdsStore)
    const lastPerspectiveThingId = get(perspectiveThingIdStore)
    
    // Create a Graph config object to save.
    const graphConfig = {
        uITrimColor: uITrimColor,
        uIBackgroundColor: uIBackgroundColor,
        graphBackgroundImage: graphBackgroundImage,
        notesBackgroundImage: notesBackgroundImage,
        readOnlyMode: readOnlyMode,
        hideMenus: hideMenus,
        leftSideMenu: leftSideMenu,
        rightSideMenu: rightSideMenu,
        notesEditorLocked: notesEditorLocked,
        homeThingId: homeThingId,
        pinIds: pinIdsStoreValue,
        perspectiveThingId: lastPerspectiveThingId
    }
    
    // Save the Graph config object to file.
    await apiSaveGraphConfig(graphConfig)
}