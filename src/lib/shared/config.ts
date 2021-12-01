import type { Config } from "$lib/shared/constants"
import { pinIdsStore } from "$lib/shared/stores/appStores"
let pinIdsStoreValue: number[]
pinIdsStore.subscribe(value => {pinIdsStoreValue = value})


// Load configuration-related values from the JSON config file.
export async function storeConfig(): Promise<void> {
    const submit = await fetch("/api/config")
    const config = await submit.json() as Config
    
    pinIdsStore.set(config.pinIds)
}

// Save configuration-related values to the JSON config file.
export async function saveConfig(): Promise<void> {
    const stringifiedConfig = JSON.stringify(
        {
            pinIds: pinIdsStoreValue
        },
    null, 4)

    await fetch("/api/config", {
        method: "POST",
        body: stringifiedConfig
    })
}