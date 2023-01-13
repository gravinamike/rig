import type { AppConfig, GraphConfig } from "$lib/shared/constants"
import { get } from "svelte/store"
import { homeThingIdStore, pinIdsStore } from "$lib/stores/pinStores"
import { getAppConfig, getGraphConfig } from "$lib/db/clientSide/getInfo"
import { setDbPort, setGraphsBaseFolder, setUnigraphFolder, saveAppConfig as apiSaveAppConfig, saveGraphConfig as apiSaveGraphConfig } from "$lib/db/clientSide/makeChanges"
import { readOnlyMode as readOnlyModeStore, perspectiveThingIdStore, leftSideMenuStore, rightSideMenuStore, notesEditorLockedStore } from "$lib/stores"


// Load configuration-related values from the JSON config file.
export async function storeAppConfig(): Promise<AppConfig> {
    const appConfig = await getAppConfig() as AppConfig

    // Set the back-end stores.
    await setDbPort()
    await setGraphsBaseFolder()
    if (appConfig.unigraphFolder) {
        await setUnigraphFolder(appConfig.unigraphFolder)
    }

    return appConfig
}

// Load configuration-related values from the JSON config file.
export async function storeGraphConfig(): Promise<void> {
    const graphConfig = await getGraphConfig() as GraphConfig

    // Set front-end stores.
    readOnlyModeStore.set(graphConfig.readOnlyMode)
    leftSideMenuStore.set(graphConfig.leftSideMenu)
    rightSideMenuStore.set(graphConfig.rightSideMenu)
    notesEditorLockedStore.set(graphConfig.notesEditorLocked)
    homeThingIdStore.set(graphConfig.homeThingId)
    pinIdsStore.set(graphConfig.pinIds)
    perspectiveThingIdStore.set(graphConfig.perspectiveThingId)
}


// Save configuration-related values to the JSON config file.
export async function saveAppConfig(): Promise<void> {
    await apiSaveAppConfig()
}

// Save configuration-related values to the JSON config file.
export async function saveGraphConfig(): Promise<void> {
    const readOnlyMode = get(readOnlyModeStore)
    const leftSideMenu = get(leftSideMenuStore)
    const rightSideMenu = get(rightSideMenuStore)
    const notesEditorLocked = get(notesEditorLockedStore)
    const homeThingId = get(homeThingIdStore)
    const pinIdsStoreValue = get(pinIdsStore)
    const lastPerspectiveThingId = get(perspectiveThingIdStore)
    
    const graphConfig = {
        readOnlyMode: readOnlyMode,
        leftSideMenu: leftSideMenu,
        rightSideMenu: rightSideMenu,
        notesEditorLocked: notesEditorLocked,
        homeThingId: homeThingId,
        pinIds: pinIdsStoreValue,
        perspectiveThingId: lastPerspectiveThingId
    }
    
    await apiSaveGraphConfig(graphConfig)
}