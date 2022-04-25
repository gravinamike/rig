import type { Config } from "$lib/shared/constants"
import { unigraphFolderStore } from "$lib/stores/appStores"
import { get } from 'svelte/store'
import { pinIdsStore } from "$lib/stores/appStores"


// Load configuration-related values from the JSON config file.
export async function storeConfig(): Promise<void> {
    const submit = await fetch("/api/config")
    const config = await submit.json() as Config
    console.log(config)
    
    unigraphFolderStore.set(config.unigraphFolder)
    console.log(get(unigraphFolderStore))
    pinIdsStore.set(config.pinIds)
}

// Save configuration-related values to the JSON config file.
export async function saveConfig(): Promise<void> {
    const unigraphFolderStoreValue = get(unigraphFolderStore)
    const pinIdsStoreValue = get(pinIdsStore)

    const config = {
        unigraphFolder: unigraphFolderStoreValue,
        pinIds: pinIdsStoreValue
    }

    await fetch("/api/config", {
        method: "POST",
        body: JSON.stringify(config, null, 4)
    })
}