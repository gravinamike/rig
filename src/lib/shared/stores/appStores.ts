import type { Config } from "$lib/shared/constants"
import { writable } from "svelte/store"


// Create navigation-related Stores.
export const pinIdsStore = writable( [] as number[] )
let pinIdsStoreValue: number[]
pinIdsStore.subscribe(value => {pinIdsStoreValue = value})

// Create UI-related stores.
export const hoveredThingIdStore = writable( null as number | null )





export async function storeConfig(): Promise<void> {
    const submit = await fetch("/api/config")

    const config = await submit.json() as Config
    pinIdsStore.set(config.pinIds)
}


export async function saveConfig(): Promise<void> {
    const stringifiedConfig = JSON.stringify({
        pinIds: pinIdsStoreValue
    }, null, 4)

    const submit = await fetch("/api/config", {
        method: "POST",
        body: stringifiedConfig
    })

    const result = await submit.json()
}