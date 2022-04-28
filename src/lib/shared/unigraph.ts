import { storeGraphConfig, saveAppConfig } from "$lib/shared/config"
import { storeGraphConstructs, clearGraphConstructs, graphOpenedStore } from "$lib/stores"

export async function openUnigraph(): Promise<void> {

    
    let unigraphFolder: string | null = null
    await fetch(`api/file/unigraphFolder`)
        .then(res => res.text())
        .then(text => unigraphFolder = text)

    if (unigraphFolder !== "null") {

        await storeGraphConfig()

        await storeGraphConstructs("Direction")
        await storeGraphConstructs("Space")
        graphOpenedStore.set(true)

        await saveAppConfig()

    } else {

        console.log(`Can't open Graph because folder has not been set.`)

    }
}

export async function closeUnigraph(): Promise<void> {
    await clearGraphConstructs("Direction")
    await clearGraphConstructs("Space")
    await clearGraphConstructs("Thing")
    graphOpenedStore.set(false)
}