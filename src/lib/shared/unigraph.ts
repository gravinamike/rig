// Import basic framework resources.
import { get } from "svelte/store"

// Import stores.
import {
    refreshGraphFoldersStore, graphFoldersStore, graphsStore,
    loadingState, openGraphStore, storeThingSearchList, clearThingSearchList,
    perspectiveThingIdStore, perspectiveSpaceIdStore, 
    storeGraphDbModels, clearGraphDbModelStore, sessionUuidStore, rightSideMenuStore, notesEditorLockedStore, homeThingIdStore, pinIdsStore, readOnlyMode
} from "$lib/stores"

// Import utility methods.
import { updateUrlHash as updateUrlHashMethod } from "$lib/shared/utility"

// Import API methods.
import { graphIsUpdated, updateGraph, graphNeedsRepair, repairGraph } from "$lib/db/clientSide/graphFile"
import { storeGraphConfig } from "$lib/shared/config"


/**
 * Open-Graph folder method.
 * 
 * Closes any existing Graph, then opens the requested Graph (with the option
 * to specify the starting Perspective Thing ID as well).
 * @param folderName - The file name of the Graph to be opened.
 * @param pThingId - The ID of the Thing, if any, that should first be used for Perspective when the Graph opens.
 * @param updateUrlHash - Whether to update the URL hash after opening the Graph.
 */
export async function openGraphFile(folderName: string, pThingId: number | null = null, updateUrlHash = false): Promise<void> {
    loadingState.set("graphLoading")
    
    // Close any existing Graph.
    await closeGraphFile()

    // Check whether the requested Graph exists. If not, abort with an error
    // alert.
    await refreshGraphFoldersStore()
    if (!get(graphFoldersStore).includes(folderName)) {
        alert(`No Graph with the name ${folderName} was found.`)
        await closeGraphFile()
        loadingState.set("configLoaded")
        return
    }

    // Set the Graph name in the cookies and store.
    document.cookie = `session-${get(sessionUuidStore)}-graphName=${folderName}; SameSite=Strict;`
    openGraphStore.set(folderName)
    
    // If the Graph isn't updated, give user the option to abort, then update
    // the Graph if they don't.
    const isUpdated = await graphIsUpdated()
    if (!isUpdated) {
        if (confirm(`This Graph's database needs to be updated to work with this version of Rig. Do you want to update it now? (It's a good idea to make a backup copy of the Graph first, and you should also make sure that nobody else is accessing this file while it is being updated.)`)) {
            await updateGraph()
        } else {
            console.log(`Canceled updating and opening Graph.`)
            await closeGraphFile()
            loadingState.set("configLoaded")
            return
        }
    }




    // If the Graph needs repair, give user the option to abort, then update
    // the Graph if they don't.
    const needsRepair = await graphNeedsRepair()
    if (needsRepair) {
        if (confirm(`This Graph's database needs to be repaired. Do you want to repair it now? (It's a good idea to make a backup copy of the Graph first, and you should also make sure that nobody else is accessing this file while it is being repaired.)`)) {
            await repairGraph()
        } else {
            console.log(`Canceled repairing and opening Graph.`)
            await closeGraphFile()
            loadingState.set("configLoaded")
            return
        }
    }





    // Load the Graph configuration into stores, overwriting Perspective Thing
    // ID store if parameter was included in the URL hash.
    await storeGraphConfig(pThingId)

    // Load starting database models into stores.
    await storeGraphDbModels("Direction")
    await storeGraphDbModels("Space")
    await storeThingSearchList()
    
    // Update the URL hash if necessary.
    if (updateUrlHash) updateUrlHashMethod({
        graph: folderName,
        thingId: get(perspectiveThingIdStore) ? String(get(perspectiveThingIdStore)) : null,
        spaceId: get(perspectiveSpaceIdStore) ? String(get(perspectiveSpaceIdStore)) : null
    })

    loadingState.set("graphLoaded")
}



/**
 * Close-Graph method.
 * 
 * Clears the cookies and stores of an open Graph.
 */
export async function closeGraphFile(updateUrlHash = false): Promise<void> {
    // Clear the cookies.
    document.cookie = `graphName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict;`

    // Clear the Graph-related stores
    openGraphStore.set(null)
    graphsStore.set([])

    // Set front-end stores.
    readOnlyMode.set(false)
    rightSideMenuStore.set(null)
    notesEditorLockedStore.set(false)
    homeThingIdStore.set(null)
    pinIdsStore.set([])
    perspectiveThingIdStore.set(null)
    perspectiveSpaceIdStore.set(null)

    // Clear the Graph construct stores.
    await clearGraphDbModelStore("Direction")
    await clearGraphDbModelStore("Space")
    await clearGraphDbModelStore("Thing")
    await clearThingSearchList()

    // Unset the URL hash.
    if (updateUrlHash) updateUrlHashMethod({
        graph: null,
        thingId: null,
        spaceId: null
    })
}