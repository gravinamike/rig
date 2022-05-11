import type { Writable } from "svelte/store"
import type { GraphConstruct } from "$lib/shared/constants"
import type { SpaceDbModel, ThingDbModel } from "$lib/models/dbModels"
import type { RelationshipBeingCreatedInfo } from "$lib/widgets/graphWidgets/relationshipBeingCreatedWidget"

import { writable, derived } from "svelte/store"
import { DirectionDbModel, isDirection, isSpace, isThing } from "$lib/models/dbModels"
import { nullRelationshipBeingCreatedInfo } from "$lib/widgets/graphWidgets/relationshipBeingCreatedWidget"
import type { ThingWidgetModel, RelationshipsWidgetModel } from "$lib/models/widgetModels"


// Create Direction-related stores (and subscriptions where applicable).
export const directionsStore = writable( {} as { [id: number]: DirectionDbModel } )
let directionsStoreValue: { [id: number]: DirectionDbModel }
directionsStore.subscribe(value => {directionsStoreValue = value})

export const directionsStoreAsArray = derived( directionsStore, $directionsStore => Object.values($directionsStore) )

export const directionIdsNotFoundStore = writable( [] as number[] );


// Create Space-related stores (and subscriptions where applicable).
export const spacesStore = writable( {} as { [id: number]: SpaceDbModel } )
let spacesStoreValue: { [id: number]: SpaceDbModel }
spacesStore.subscribe(value => {spacesStoreValue = value})

export const spacesStoreAsArray = derived( spacesStore, $spacesStore => Object.values($spacesStore) )

export const spaceIdsNotFoundStore = writable( [] as number[] );


// Create Things-related stores (and subscriptions where applicable).
export const thingsStore = writable( {} as { [id: number]: ThingDbModel } )
let thingsStoreValue: { [id: number]: ThingDbModel }
thingsStore.subscribe(value => {thingsStoreValue = value})

export const thingsStoreAsArray = derived( thingsStore, $thingsStore => Object.values($thingsStore) )

export const thingIdsNotFoundStore = writable( [] as number[] );


/* 
 * Function to add Graph constructs to stores.
 */
function updateConstructStore<Type extends GraphConstruct>( constructs: Type | Type[] ): void {
    // If necessary, pack a single supplied construct in an array for processing.
    if (!("length" in constructs)) constructs = [constructs]
    
    // Determine which store to update based on construct type.
    let store: Writable<{ [id: number]: GraphConstruct }>
    if ( constructs.length && isDirection(constructs[0]) ) {
        store = directionsStore
    } else if ( constructs.length && isSpace(constructs[0]) ) {
        store = spacesStore
    } else if ( constructs.length && isThing(constructs[0]) ) {
        store = thingsStore
    } else {
        return
    }

    // Update the store with each supplied construct.
    constructs.forEach((construct) => {
        store.update( (current) => { current[construct.id] = construct; return current } )
    })
}

/* 
 * Function to add Graph construct ids to stores.
 */
function updateIdStore( constructName: "Direction" | "Space" | "Thing", ids: number | number[] ): void {
    // If necessary, pack a single supplied id in an array for processing.
    if (typeof ids === "number") ids = [ids]

    // Determine which store to update based on construct name.
    let store: Writable<number[]>
    if (constructName === "Direction") {
        store = directionIdsNotFoundStore
    } else if (constructName === "Space") {
        store = spaceIdsNotFoundStore
    } else if (constructName === "Thing") {
        store = thingIdsNotFoundStore
    }

    // Update the store with each supplied id.
    ids.forEach((id) => {
        store.update( (current) => { if (!current.includes(id)) current.push(id); return current } )
    })
}

/* 
 * Function to check whether a Graph construct is in the store (by ID).
 */
export function graphConstructInStore( constructName: "Direction" | "Space" | "Thing", id: number ): boolean {
    // Determine which store to check based on construct name.
    const storeValue = {
        "Direction": directionsStoreValue,
        "Space": spacesStoreValue,
        "Thing": thingsStoreValue
    }[constructName]

    // Determine if the construct id is in the store.
    return id in storeValue ? true : false
}

/* 
 * Function to fetch Graph constructs from the API, then add them to the stores.
 */
export async function storeGraphConstructs<Type extends GraphConstruct>(
    constructName: "Direction" | "Space" | "Thing",
    ids?: number | number[],
    allowUpdating = false
): Promise<Type[]> {
    // Determine which store to check based on construct name.
    const storeValue = {
        "Direction": directionsStoreValue,
        "Space": spacesStoreValue,
        "Thing": thingsStoreValue
    }[constructName]

    let res: Response
    let idsToQuery: number[] = []
    
    // If no IDs were provided, fetch all instances of this construct.
    if (typeof ids === "undefined") {
        res = await fetch(`api/db/graphConstructs/${ constructName.toLowerCase() }s-all`)

    // Else, if IDs *were* provided,
    } else {
        // Convert single IDs into arrays for processing (if needed).
        if ( typeof ids === "number" ) ids = [ids]
        // Get array of IDs to query.
        if (allowUpdating) {
            // If updating is allowed, use the full array of supplied IDs.
            idsToQuery = ids
        } else {
            // If updating is not allowed, filter any IDs that are already stored out of the supplied array.
            const idsNotToQuery = Object.keys(storeValue).map(x => Number(x))
            idsToQuery = ids.filter( x => !idsNotToQuery.includes(x) )
        }
        // Fetch the instances from the API.
        if (!idsToQuery.length) return []
        res = await fetch(`api/db/graphConstructs/${ constructName.toLowerCase() }s-${idsToQuery.join(",")}`);
    }

    // If the response is ok,
    if (res.ok) {
        // Unpack the response JSON as an array of instances.
        const queriedInstances = await res.json() as Type[]
        // Update the store with these instances.
        updateConstructStore(queriedInstances)
        // Update the IDs Not Found store with any IDs that weren't fetched.
        if (!(typeof ids === "undefined")) {
            const idsFound = queriedInstances.map(x => x.id)
            const idsNotFound = idsToQuery.filter( x => !idsFound.includes(x) )
            updateIdStore(constructName, idsNotFound)
        }
        // Return the array of Directions.
        return queriedInstances

    // Handle errors if needed.
    } else {
        res.text().then(text => {throw Error(text)})
        return []
    }
}

/* 
 * Function to remove Graph constructs from the Stores.
 */
export async function unstoreGraphConstructs(
    constructName: "Direction" | "Space" | "Thing",
    ids: number | number[]
): Promise<void> {
    // Determine which store to update based on construct name.
    const store: Writable<{[id: number]: GraphConstruct}> = {
        "Direction": directionsStore,
        "Space": spacesStore,
        "Thing": thingsStore
    }[constructName]

    // Convert single IDs into arrays for processing (if needed).
    if ( typeof ids === "number" ) ids = [ids]

    // Update the store with each supplied id.
    ids.forEach((id) => {
        store.update( (current) => { delete current[id]; return current } )
    })

    return
}

/* 
 * Function to clear a Graph construct Store.
 */
export async function clearGraphConstructs(constructName: "Direction" | "Space" | "Thing"): Promise<void> {
    // Determine which store to clear based on construct name.
    const store: Writable<{[id: number]: GraphConstruct}> = {
        "Direction": directionsStore,
        "Space": spacesStore,
        "Thing": thingsStore
    }[constructName]

    store.set({})

    return
}

/* 
 * Function to retrieve Graph constructs from the stores.
 */
export function retrieveGraphConstructs<Type extends GraphConstruct>(
    constructName: "Direction" | "Space" | "Thing",
    ids: number
): Type | null
export function retrieveGraphConstructs<Type extends GraphConstruct>(
    constructName: "Direction" | "Space" | "Thing",
    ids: number[]
): Type[]
export function retrieveGraphConstructs<Type extends GraphConstruct>(
    constructName: "Direction" | "Space" | "Thing",
    ids: number | number[]
): Type[] | Type | null {
    // Determine which store to get construct from based on construct name.
    let storeValue: { [id: number]: GraphConstruct }
    if (constructName === "Direction") {
        storeValue = directionsStoreValue
    } else if (constructName === "Space") {
        storeValue = spacesStoreValue
    } else {
        storeValue = thingsStoreValue
    }
    
    // For single IDs, return the stored construct or null if there isn't one stored.
    if (typeof ids === "number") {
        const output = graphConstructInStore(constructName, ids) ? storeValue[ids] as Type : null
        return output
    // For an array of IDs, return an array of the stored constructs that match.
    } else {
        const output: Type[] = []
        for (const id of ids) {
            if (graphConstructInStore(constructName, id)) output.push(storeValue[id] as Type)
        }
        return output
    }
}

export const openGraphStore = writable( null as string | null )















export const relationshipBeingCreatedInfoStore = writable(
    {
        sourceWidgetModel: null,
        destWidgetModel: null,
        startPosition: [0, 0],
        endPosition: [0, 0],
        trackingMouse: false,
        selectedDirection: null
    } as RelationshipBeingCreatedInfo
)

/**
 * Enable the Relationship-being-created Widget.
 */
export function enableRelationshipBeingCreated(sourceWidgetModel: ThingWidgetModel | RelationshipsWidgetModel, position: [number, number]): void {
    relationshipBeingCreatedInfoStore.set(
        {
            sourceWidgetModel: sourceWidgetModel,
            destWidgetModel: null,
            startPosition: position,
            endPosition: position,
            trackingMouse: true,
            selectedDirection: null
        }
    )
}

/**
 * 
 */
export function updateRelationshipBeingCreatedEndpoint(position: [number, number]): void {
    relationshipBeingCreatedInfoStore.update( current => {
        current.endPosition = current.trackingMouse ? position : current.endPosition
        return current
    } )
}

export function setRelationshipBeingCreatedDestWidgetModel(destWidgetModel: ThingWidgetModel | RelationshipsWidgetModel | null): void {
    relationshipBeingCreatedInfoStore.update( current => {
        current.destWidgetModel = destWidgetModel
        return current
    } )
}

export function setRelationshipBeingCreatedTrackingMouse(trackingMouse: boolean): void {
    relationshipBeingCreatedInfoStore.update( current => {
        current.trackingMouse = trackingMouse
        return current
    } )
}

/**
 * Disable the Relationship-being-created Widget.
 */
export function disableRelationshipBeingCreated(): void {
    relationshipBeingCreatedInfoStore.update( () => nullRelationshipBeingCreatedInfo )
}


export const hoveredRelationshipTarget = writable(
    null as (ThingWidgetModel | RelationshipsWidgetModel | null)
)

export const inferredRelationshipBeingCreatedDirection = derived(
    relationshipBeingCreatedInfoStore,
    $relationshipBeingCreatedInfoStore => {
        const sourceWidgetModel = $relationshipBeingCreatedInfoStore.sourceWidgetModel
        const destWidgetModel = $relationshipBeingCreatedInfoStore.destWidgetModel
        const selectedDirection = $relationshipBeingCreatedInfoStore.selectedDirection

        let direction: DirectionDbModel | null
        if (sourceWidgetModel && sourceWidgetModel.kind === "relationshipsWidgetModel") {
            direction = sourceWidgetModel.direction
        } else if (destWidgetModel && destWidgetModel.kind === "relationshipsWidgetModel") {
            direction = (
                destWidgetModel.direction.oppositeid ?
                    retrieveGraphConstructs("Direction", destWidgetModel.direction.oppositeid) :
                    null
            )
        } else {
            direction = selectedDirection
        }

        return direction
    }
)








// Create Graph-related stores (and subscriptions where applicable).
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
