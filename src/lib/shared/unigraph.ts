import { storeGraphConfig, saveAppConfig } from "$lib/shared/config"
import { storeGraphConstructs, clearGraphConstructs, storeThingSearchList, clearThingSearchList } from "$lib/stores"

export async function openUnigraph(): Promise<boolean> {

    
    let unigraphFolder: string | null = null
    await fetch(`api/file/unigraphFolder`)
        .then(res => res.text())
        .then(text => unigraphFolder = text)

    if (unigraphFolder !== "null") {

        await storeGraphConfig()

        await storeGraphConstructs("Direction")
        await storeGraphConstructs("Space")
        await storeThingSearchList()

        await saveAppConfig()

        return true

    } else {

        console.log(`Can't open Graph because folder has not been set.`)

        return false

    }
}

export async function closeUnigraph(): Promise<void> {
    await clearGraphConstructs("Direction")
    await clearGraphConstructs("Space")
    await clearGraphConstructs("Thing")
    await clearThingSearchList()
}