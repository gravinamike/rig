import { storeGraphConfig, saveAppConfig } from "$lib/shared/config"
import { storeGraphConstructs, clearGraphConstructs, storeThingSearchList, clearThingSearchList } from "$lib/stores"
import { getUnigraphFolder, setUnigraphFolder } from "$lib/db/clientSide"
import { loadingState, openGraphStore } from "$lib/stores"

export async function openUnigraph(): Promise<boolean> {
    const unigraphFolder = await getUnigraphFolder()

    if (!unigraphFolder) {

        console.log(`Error retrieving Graph folder.`)

        return false

    } else if (unigraphFolder !== "null") {

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


export async function openUnigraphFolder(folderName: string): Promise<void> {
    await setUnigraphFolder(folderName)

    await closeUnigraph()
    openGraphStore.set(null)
    
    loadingState.set("graphLoading")
    await openUnigraph()
    openGraphStore.set(folderName)
    loadingState.set("graphLoaded")
}