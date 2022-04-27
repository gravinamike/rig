import { storeGraphConfig } from "$lib/shared/config"
import { storeGraphConstructs, clearGraphConstructs, graphConstructsStoredStore } from "$lib/stores"

export async function openUnigraph(): Promise<void> {
    await storeGraphConfig()

    await storeGraphConstructs("Direction")
    await storeGraphConstructs("Space")
    graphConstructsStoredStore.set(true)
}

export async function closeUnigraph(): Promise<void> {
    await clearGraphConstructs("Direction")
    await clearGraphConstructs("Space")
    await clearGraphConstructs("Thing")
    graphConstructsStoredStore.set(false)
}