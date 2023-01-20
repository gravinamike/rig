import type { ThingSearchListItem } from "$lib/models/constructModels"

import { writable } from "svelte/store"
import { Graph, Space } from "$lib/models/constructModels"
import { thingSearchListItems } from "$lib/db/clientSide"





export const openGraphStore = writable( null as string | null )






// Create Graph-related stores (and subscriptions where applicable).
export const graphsStore = writable( [] as Graph[] )
let graphsStoreValue: Graph[]
graphsStore.subscribe(value => {graphsStoreValue = value})

export async function addGraph(pThingIds: number[], depth: number, parentGraph: (Graph | null)=null, offAxis=false, startingSpace: (Space | null)=null): Promise<Graph> {
    const allGraphIds = graphsStoreValue.map(graph => graph.id)
    const newGraphId = allGraphIds.length ? Math.max(...allGraphIds) + 1 : 1

    const graph = new Graph(newGraphId, pThingIds, depth, parentGraph, offAxis, startingSpace)
    await graph.build()

    graphsStore.update( current => {
        if (!current.includes(graph)) current.push(graph)
        return current
    } )

    return graph
}

export async function retrieveGraph(graphId: number): Promise<Graph | null> {
    if (graphId <= 1 && !(graphId > graphsStoreValue.length)) {
        return graphsStoreValue[graphId - 1]
    } else {
        return null
    }
}

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


// Perspective-Thing-ID Store.
// Holds the ID of the Graph's Perspective Thing.
export const perspectiveThingIdStore = writable( null as number | null )



export const perspectiveSpaceIdStore = writable( null as number | null )






export const leftSideMenuStore = writable( null as string | null )
export const rightSideMenuStore = writable( null as string | null )
export const notesEditorLockedStore = writable ( false )






export const graphIdsNeedingViewerRefresh = writable( [] as number[] )

/**
 * 
 */
export function addGraphIdsNeedingViewerRefresh(graphIds: number | number[]): void {
    if (typeof graphIds === "number") graphIds = [graphIds]
    for (const graphId of graphIds) {
        graphIdsNeedingViewerRefresh.update( current => {
            if (!current.includes(graphId)) current.push(graphId)
            return current
        } )
    }
}

/**
 * 
 */
export function removeGraphIdsNeedingViewerRefresh(graphIds: number | number[]): void {
    if (typeof graphIds === "number") graphIds = [graphIds]
    for (const graphId of graphIds) {
        graphIdsNeedingViewerRefresh.update( current => {
            const index = current.indexOf(graphId)
            if (index > -1) current.splice(index, 1)
            return current
        } )
    }
}











export const thingSearchListStore = writable( [] as ThingSearchListItem[] )

export async function updateThingSearchListStore( thingSearchListItems: ThingSearchListItem | ThingSearchListItem[] ): Promise<void> {
    // If necessary, pack a single supplied Thing search list item in an array for processing.
    if (!("length" in thingSearchListItems)) thingSearchListItems = [thingSearchListItems]

    // Update the store with each supplied construct.
    thingSearchListStore.update( (current) => [...current, ...(thingSearchListItems as ThingSearchListItem[]) ] )
}

export async function removeIdsFromThingSearchListStore( thingIds: number | number[] ): Promise<void> {
    // If necessary, pack a single supplied Thing ID in an array for processing.
    if (typeof thingIds === "number") thingIds = [thingIds]

    // Update the store with each supplied construct.
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

export async function storeThingSearchList(): Promise<ThingSearchListItem[]> {  
    const queriedThingSearchListItems = await thingSearchListItems()
    if (queriedThingSearchListItems) {
        // Update the store with this list.
        updateThingSearchListStore(queriedThingSearchListItems)
        // Return the Thing search List.
        return queriedThingSearchListItems
    } else {
        return []
    }
}

/* 
 * Function to clear a Graph construct Store.
 */
export async function clearThingSearchList(): Promise<void> {
    thingSearchListStore.set([])
}