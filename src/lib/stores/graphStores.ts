// Import ypes.
import type { MenuName } from "$lib/shared/constants"
import type { ThingSearchListItem, NoteSearchListItem } from "$lib/models/constructModels"

// Import basic framework resources.
import { writable, get } from "svelte/store"

// Import Graph constructs.
import { Graph, Space } from "$lib/models/constructModels"

// Import API methods.
import { getNoteSearchListItems, getThingSearchListItems } from "$lib/db"




/**
 * Open Graph store.
 * 
 * Stores the name of the currently-open Graph file.
 */
export const openGraphStore = writable( null as string | null )



/**
 * Graphs store.
 * 
 * Stores all Graphs (the object class, not the files) that currently exist in
 * the app.
 */
export const graphsStore = writable( [] as Graph[] )

/**
 * Add-Graph method.
 * 
 * Create and build a new Graph, and add it to the Graphs store.
 * @param pThingIds - The IDs of the Perspective Things for the new Graph.
 * @param depth - The desired relational depth for the new Graph.
 * @param parentGraph - The Graph that is the parent of the new Graph, if any.
 * @param offAxis - Whether the Graph is the "off-axis" relationships for a Thing in another Graph.
 * @param startingSpace - The top-level Space that the Graph is rendered into.
 * @returns - The new Graph.
 */
export async function addGraph(
    pThingIds: number[],
    depth: number,
    parentGraph: (Graph | null) = null,
    offAxis=false,
    isSearchMenu=false,
    startingSpace: (Space | null) = null
): Promise<Graph> {
    // Calculate the ID for the new Graph based on the maximum existing Graph
    // ID.
    const graphsStoreValue = get(graphsStore)
    const allGraphIds = graphsStoreValue.map(graph => graph.id)
    const newGraphId = allGraphIds.length ? Math.max(...allGraphIds) + 1 : 1

    // Create and build the new Graph.
    const graph = new Graph(newGraphId, pThingIds, depth, parentGraph, offAxis, isSearchMenu, startingSpace)
    await graph.build()

    // Add the Graph to the Graphs store if it's not already there.
    graphsStore.update( current => {
        if (!current.includes(graph)) current.push(graph)
        return current
    } )

    // Return the Graph.
    return graph
}



/**
 * Retrieve-Graph method.
 * 
 * Retrieves a Graph from the Graph store by ID.
 * @param graphId - The ID of the Graph to retrieve.
 * @returns - The retrieved Graph.
 */
export async function retrieveGraph(graphId: number): Promise<Graph | null> {
    // Get the Graph store.
    const graphsStoreValue = get(graphsStore)

    // If the supplied ID was valid, return the Graph.
    if (graphId <= 1 && !(graphId > graphsStoreValue.length)) {
        return graphsStoreValue[graphId - 1]

    // Otherwise return null.
    } else {
        return null
    }
}

/**
 * Remove-Graph method.
 * 
 * Removes a Graph and all its children Graphs from the Graphs store.
 * @param graph 
 */
export async function removeGraph(graph: Graph): Promise<void> {
    // First remove the Graph's children.
    for (const childGraph of graph.childGraphs) {
        removeGraph(childGraph)
    }

    // Then remove the Graph itself.
    graphsStore.update( current => {
        const index = current.indexOf(graph)
        if (index > -1) current.splice(index, 1)
        return current
    } )
}

/**
 * Graph-IDs-needing-viewer-refresh store.
 * 
 * Adding a Graph ID to this store causes the corresponding Graph viewers to be
 * reactively refreshed.
 */
export const graphIdsNeedingViewerRefresh = writable( [] as number[] )

/**
 * Add-Graph-IDs-needing-viewer-refresh method.
 * 
 * Adds Graph IDs to the Graph-IDs-needing-viewer-refresh store.
 * @param graphIds = The IDs of the Graphs to be added.
 */
export function addGraphIdsNeedingViewerRefresh(graphIds: number | number[]): void {
    // Repackage single IDs in arrays for processing.
    if (typeof graphIds === "number") graphIds = [graphIds]

    // For each specified ID, add it to the store if it's not there yet.
    for (const graphId of graphIds) {
        graphIdsNeedingViewerRefresh.update( current => {
            if (!current.includes(graphId)) current.push(graphId)
            return current
        } )
    }
}

/**
 * Remove-Graph-IDs-needing-viewer-refresh method.
 * 
 * Removes Graph IDs from the Graph-IDs-needing-viewer-refresh store.
 * @param graphIds = The IDs of the Graphs to be removed.
 */
export function removeGraphIdsNeedingViewerRefresh(graphIds: number | number[]): void {
    // Repackage single IDs in arrays for processing.
    if (typeof graphIds === "number") graphIds = [graphIds]

    // For each specified ID, remove it from the store.
    for (const graphId of graphIds) {
        graphIdsNeedingViewerRefresh.update( current => {
            const index = current.indexOf(graphId)
            if (index > -1) current.splice(index, 1)
            return current
        } )
    }
}


/**
 * Perspective-Thing-ID Store.
 * 
 * Holds the ID of the Graph's Perspective Thing.
 */
export const perspectiveThingIdStore = writable( null as number | null )

/**
 * Perspective-Space-ID Store.
 * 
 * Holds the ID of the Graph's Perspective Space.
 */
export const perspectiveSpaceIdStore = writable( null as number | null )


/**
 * Show-menu store.
 */
export const hideMenusStore = writable( [] as MenuName[] )


/**
 * Graph-level menu-state stores.
 */
export const leftSideMenuStore = writable( null as string | null )
export const rightSideMenuStore = writable( null as string | null )
export const notesEditorLockedStore = writable ( false )
export const notesToolbarExpandedStore = writable ( false )


/**
 * Thing search list store.
 * 
 * Stores an array of Thing search list items for use by the Thing search dialog.
 */
export const thingSearchListStore = writable( [] as ThingSearchListItem[] )

/**
 * Store-Thing-search-list method.
 * 
 * Stores an array of Thing search list items based on a database search of the
 * Things table.
 * @returns - Array of the stored Thing search list items, if any.
 */
export async function storeThingSearchList(): Promise<ThingSearchListItem[]> {  
    const graphWhenStarting = get(openGraphStore)

    const queriedThingSearchListItems = await getThingSearchListItems()

    const currentGraph = get(openGraphStore)

    // If search list items were found, and the Graph hasn't changed,
    if (
        queriedThingSearchListItems
        && currentGraph === graphWhenStarting
    ) {
        // Update the store with this list.
        updateThingSearchListStore(queriedThingSearchListItems)
        
        // Return the Thing search list.
        return queriedThingSearchListItems
    } else {
        return []
    }
}

/**
 * Update-Thing-search-list-store method.
 * 
 * Adds some Thing search list items to the Thing-search-list-store.
 * @param thingSearchListItems - The Thing search list items to add.
 */
export async function updateThingSearchListStore(
    thingSearchListItems: ThingSearchListItem | ThingSearchListItem[]
): Promise<void> {
    // If necessary, pack a single supplied Thing search list item in an array for processing.
    if (!("length" in thingSearchListItems)) thingSearchListItems = [thingSearchListItems]

    // Update the store with the items.
    thingSearchListStore.update( (current) => [...current, ...(thingSearchListItems as ThingSearchListItem[]) ] )
}

/**
 * Remove-Thing-search-list-store method.
 * 
 * Removes some Thing search list items from the Thing-search-list-store.
 * @param thingSearchListItems - The Thing search list items to remove.
 */
export async function removeIdsFromThingSearchListStore( thingIds: number | number[] ): Promise<void> {
    // If necessary, pack a single supplied Thing ID in an array for processing.
    if (typeof thingIds === "number") thingIds = [thingIds]

    // Remove the items from the store.
    thingSearchListStore.update( (current) => {
        for (const thingSearchListItem of current) {
            if (thingSearchListItem.id && (thingIds as number[]).includes(thingSearchListItem.id)) {
                const index = current.indexOf(thingSearchListItem)
                if (index > -1) {
                    current.splice(index, 1)
                }
            }
        }
        return current
    } )
}

/**
 * Clear-Thing-search-list method.
 * 
 * Set the Thing-search-list-store to an empty array.
 */
export async function clearThingSearchList(): Promise<void> {
    thingSearchListStore.set([])
}


/**
 * Notes search list store.
 * 
 * Stores an array of Notes search list items for use by the Thing search dialog.
 */
export const noteSearchListStore = writable( [] as NoteSearchListItem[] )

/**
 * Store-Notes-search-list method.
 * 
 * Stores an array of Notes search list items based on a database search of the
 * Notes table.
 * @returns - Array of the stored Notes search list items, if any.
 */
export async function storeNotesSearchList(): Promise<NoteSearchListItem[]> {

    const graphWhenStarting = get(openGraphStore)

    const queriedNoteSearchListItems = await getNoteSearchListItems()

    const currentGraph = get(openGraphStore)

    // If search list items were found, and the Graph hasn't changed,
    if (
        queriedNoteSearchListItems
        && currentGraph === graphWhenStarting
    ) {
        // Update the store with this list.
        updateNoteSearchListStore(queriedNoteSearchListItems)
        
        // Return the Note search list.
        return queriedNoteSearchListItems
    } else {
        return []
    }
}

/**
 * Update-Note-search-list-store method.
 * 
 * Adds some Note search list items to the Note-search-list-store.
 * @param noteSearchListItems - The Note search list items to add.
 */
export async function updateNoteSearchListStore(
    noteSearchListItems: NoteSearchListItem | NoteSearchListItem[]
): Promise<void> {
    // If necessary, pack a single supplied Note search list item in an array for processing.
    if (!("length" in noteSearchListItems)) noteSearchListItems = [noteSearchListItems]

    // Get the current value of the Note search list store.
    const currentNoteSearchListStore = get(noteSearchListStore)

    // For each of the supplied Note search list items,
    for (const noteSearchListItem of noteSearchListItems) {
        // Get the matching index (if it exists) in the store.
        const indexOfNoteSearchListItem = currentNoteSearchListStore.findIndex(item => item.id === noteSearchListItem.id)

        // If the item exists in the store already,
        if (indexOfNoteSearchListItem !== -1) {
            // Update the store by overwriting the item's text.
            noteSearchListStore.update( (current) => {
                current[indexOfNoteSearchListItem].text = noteSearchListItem.text; return current
            } )
        // Otherwise,
        } else {
            // Update the store by adding the item.
            noteSearchListStore.update( (current) => [...current, noteSearchListItem] )
        }
    }
}

/**
 * Remove-Note-search-list-store method.
 * 
 * Removes some Note search list items from the Note-search-list-store.
 * @param noteSearchListItems - The Note search list items to remove.
 */
export async function removeIdsFromNoteSearchListStore( noteIds: number | number[] ): Promise<void> {
    // If necessary, pack a single supplied Note ID in an array for processing.
    if (typeof noteIds === "number") noteIds = [noteIds]

    // Remove the items from the store.
    noteSearchListStore.update( (current) => {
        for (const noteSearchListItem of current) {
            if (noteSearchListItem.id && (noteIds as number[]).includes(noteSearchListItem.id)) {
                const index = current.indexOf(noteSearchListItem)
                if (index > -1) {
                    current.splice(index, 1)
                }
            }
        }
        return current
    } )
}

/**
 * Clear-Note-search-list method.
 * 
 * Set the Note-search-list-store to an empty array.
 */
export async function clearNoteSearchList(): Promise<void> {
    noteSearchListStore.set([])
}