// Import types.
import type { AppConfig, GraphConfig } from "$lib/shared/constants"

// Import SvelteKit framework resources.
import { get } from "svelte/store"

// Import constants.
import { defaultUITrimColor, defaultGraphBackgroundColor, defaultThingColor } from "$lib/shared/constants"

// Import stores.
import {
    leftSideMenuStore, rightSideMenuStore, hideMenusStore,
    uITrimColorStore, mobileMenuTrimColorStore, graphBackgroundImageStore, graphBackgroundColorStore, thingColorStore,
    notesBackgroundImageStore, defaultFontStore, titleFontStore, titleFontWeightStore,
    readOnlyMode as readOnlyModeStore, canEdit as canEditStore, preventEditing as preventEditingStore, notesEditorLockedStore,
    homeThingIdStore, pinIdsStore, perspectiveThingIdStore, canAccessFileMenuStore, userIdStore, canEdit
} from "$lib/stores"

// Import API methods.
import { getAppConfig, getGraphConfig } from "$lib/db"
import {
    setDbPort, setGraphsBaseFolder, saveAppConfig as apiSaveAppConfig, saveGraphConfig as apiSaveGraphConfig
} from "$lib/db/makeChanges"



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
    
    // Set the front-end stores.
    if ("canAccessFileMenu" in appConfig && Array.isArray(appConfig["canAccessFileMenu"])) {
        canAccessFileMenuStore.set(appConfig["canAccessFileMenu"] as string[])
    }

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
        graphConfig.uITrimColor || defaultUITrimColor
    )
    graphBackgroundImageStore.set(
        graphConfig.graphBackgroundImage || null
    )
    graphBackgroundColorStore.set(
        graphConfig.graphBackgroundColor || defaultGraphBackgroundColor
    )
    thingColorStore.set(
        graphConfig.thingColor || defaultThingColor
    )
    notesBackgroundImageStore.set(
        graphConfig.notesBackgroundImage || null
    )
    defaultFontStore.set(
        graphConfig.defaultFont || null
    )
    titleFontStore.set(
        graphConfig.titleFont || null
    )
    titleFontWeightStore.set(
        graphConfig.titleFontWeight || null
    )
    readOnlyModeStore.set(graphConfig.readOnlyMode)
    canEdit.set(graphConfig.canEdit)
    preventEditingStore.set(
        !(
            graphConfig.canEdit.includes("all")
            || (get(userIdStore) !== null && graphConfig.canEdit.includes(get(userIdStore) as string))
        )
        || graphConfig.readOnlyMode === true
    )
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
    const mobileMenuTrimColor = get(mobileMenuTrimColorStore)
    const graphBackgroundColor = get(graphBackgroundColorStore)
    const thingColor = get(thingColorStore)
    const graphBackgroundImage = get(graphBackgroundImageStore)
    const notesBackgroundImage = get(notesBackgroundImageStore)
    const defaultFont = get(defaultFontStore)
    const titleFont = get(titleFontStore)
    const titleFontWeight = get(titleFontWeightStore)
    const readOnlyMode = get(readOnlyModeStore)
    const canEdit = get(canEditStore)
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
        mobileMenuTrimColor: mobileMenuTrimColor,
        graphBackgroundColor: graphBackgroundColor,
        thingColor: thingColor,
        graphBackgroundImage: graphBackgroundImage,
        notesBackgroundImage: notesBackgroundImage,
        defaultFont: defaultFont,
        titleFont: titleFont,
        titleFontWeight: titleFontWeight,
        readOnlyMode: readOnlyMode,
        canEdit: canEdit,
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