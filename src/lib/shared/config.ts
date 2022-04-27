import type { AppConfig, GraphConfig } from "$lib/shared/constants"
import { unigraphFolderStore } from "$lib/stores/appStores"
import { get } from "svelte/store"
import { pinIdsStore } from "$lib/stores/appStores"


// Load configuration-related values from the JSON config file.
export async function storeAppConfig(): Promise<void> {
    const submit = await fetch("/api/file/appConfig")
    const appConfig = await submit.json() as AppConfig////////////////////////// NEEDS TO CHANGE

    // Set the back-end stores.
    if (appConfig.unigraphFolder) {
        await fetch("/api/file/unigraphFolder", {
            method: "POST",
            body: JSON.stringify(appConfig.unigraphFolder)
        })
    }
}

// Load configuration-related values from the JSON config file.
export async function storeGraphConfig(): Promise<void> {
    const submit = await fetch("/api/file/graphConfig")
    const graphConfig = await submit.json() as GraphConfig

    // Set front-end stores.
    pinIdsStore.set(graphConfig.pinIds)
}


// Save configuration-related values to the JSON config file.
export async function saveAppConfig(): Promise<void> {
    const unigraphFolderStoreValue = get(unigraphFolderStore)

    const appConfig = {
        unigraphFolder: unigraphFolderStoreValue
    }

    await fetch("/api/file/graphConfig", {
        method: "POST",
        body: JSON.stringify(appConfig, null, 4)
    })
}

// Save configuration-related values to the JSON config file.
export async function saveGraphConfig(): Promise<void> {
    const pinIdsStoreValue = get(pinIdsStore)

    const graphConfig = {
        pinIds: pinIdsStoreValue
    }

    await fetch("/api/file/graphConfig", {
        method: "POST",
        body: JSON.stringify(graphConfig, null, 4)
    })
}