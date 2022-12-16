import { storeGraphConfig, saveAppConfig } from "$lib/shared/config"
import { storeGraphDbModels, clearGraphDbModelStore, storeThingSearchList, clearThingSearchList } from "$lib/stores"
import { getUnigraphFolder, setUnigraphFolder } from "$lib/db/clientSide"
import { loadingState, openGraphStore } from "$lib/stores"
import { graphIsUpdated, updateGraph } from "$lib/db/clientSide/graphFile"

export async function openUnigraph(): Promise<boolean> {
    const unigraphFolder = await getUnigraphFolder()

    if (!unigraphFolder) {

        console.log(`Error retrieving Graph folder.`)

        return false

    } else if (unigraphFolder !== "null") {

        const isUpdated = await graphIsUpdated()

        // Give user the option to abort before updating the Graph.
        if (!isUpdated) {
            if (confirm(`This Graph's database needs to be updated to work with this version of Rig. Do you want to update it now? (It's a good idea to make a backup copy of the Graph first.)`)) {
                updateGraph()
            } else {
                console.log(`Canceled updating and opening Graph.`)
                return false
            }
        }

        await storeGraphConfig()

        await storeGraphDbModels("Direction")
        await storeGraphDbModels("Space")
        await storeThingSearchList()

        await saveAppConfig()

        return true

    } else {

        console.log(`Can't open Graph because folder has not been set.`)

        return false

    }
}

export async function closeUnigraph(): Promise<void> {
    await clearGraphDbModelStore("Direction")
    await clearGraphDbModelStore("Space")
    await clearGraphDbModelStore("Thing")
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