import { storeGraphConfig, saveAppConfig } from "$lib/shared/config"
import { storeGraphDbModels, clearGraphDbModelStore, storeThingSearchList, clearThingSearchList, urlStore } from "$lib/stores"
import { loadingState, openGraphStore } from "$lib/stores"
import { graphIsUpdated, updateGraph } from "$lib/db/clientSide/graphFile"
import { get } from "svelte/store"





export async function openUnigraphFolder(folderName: string, updateUrlHash=false): Promise<void> {
    await closeUnigraph()
    openGraphStore.set(null)
    

    loadingState.set("graphLoading")


    const url = get(urlStore)////////////////////////////// MOVE THIS WHOLE SECTION TO A "UPDATE HASH" FUNCTION
    url.hash = `graph=${folderName}`
    if (updateUrlHash) document.location.href = url.href


    document.cookie = `graphName=${folderName}`
    openGraphStore.set(folderName)
    await openUnigraph()

    loadingState.set("graphLoaded")
}


export async function openUnigraph(): Promise<boolean> {

    const unigraphFolder = get(openGraphStore)

    if (!unigraphFolder) {

        console.log(`No Graph folder set - aborting open-Graph operation.`)

        return false

    } else {


        // Update the Graph if necessary.

        // Check if the Graph is up-to-date.
        const isUpdated = await graphIsUpdated()
        
        // Give user the option to abort, then update the Graph if they don't.
        if (!isUpdated) {
            if (confirm(`This Graph's database needs to be updated to work with this version of Rig. Do you want to update it now? (It's a good idea to make a backup copy of the Graph first.)`)) {
                await updateGraph()
            } else {
                console.log(`Canceled updating and opening Graph.`)
                return false
            }
        }


        // Load the Graph configuration into stores.
        await storeGraphConfig()

        // Load starting database models into stores.
        await storeGraphDbModels("Direction")
        await storeGraphDbModels("Space")
        await storeThingSearchList()


        // Save the Graph configuration to file.
        await saveAppConfig()

        return true

    }
}









export async function closeUnigraph(): Promise<void> {
    await clearGraphDbModelStore("Direction")
    await clearGraphDbModelStore("Space")
    await clearGraphDbModelStore("Thing")
    await clearThingSearchList()
}


