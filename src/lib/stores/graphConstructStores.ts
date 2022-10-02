// Import types.
import type { Writable } from "svelte/store"
import type { GraphConstruct } from "$lib/shared/constants"
import type { DirectionDbModel, SpaceDbModel, ThingDbModel, GraphDbModel } from "$lib/models/dbModels"

// Import framework tools.
import { writable, derived } from "svelte/store"

// Import constants.
import { maxThingsToStore } from "$lib/shared/constants"

// Import Graph constructs.
import { isDirectionDbModel, isSpaceDbModel, isThingDbModel } from "$lib/models/dbModels"

// Import API methods.
import { graphDbModels } from "$lib/db/clientSide"
import { Direction, Space, Thing } from "$lib/models/constructModels"





/* Direction-related stores and subscriptions. */

export const directionDbModelsStore = writable( {} as { [id: number]: DirectionDbModel } )

let directionDbModelsStoreValue: { [id: number]: DirectionDbModel }
directionDbModelsStore.subscribe(value => {directionDbModelsStoreValue = value})

export const directionDbModelsStoreAsArray = derived(
    directionDbModelsStore,
    $directionDbModelsStore => Object.values($directionDbModelsStore)
)

export const directionIdsNotFoundStore = writable( [] as number[] )


/* Space-related stores and subscriptions. */

export const spaceDbModelsStore = writable( {} as { [id: number]: SpaceDbModel } )
let spaceDbModelsStoreValue: { [id: number]: SpaceDbModel }
spaceDbModelsStore.subscribe(value => {spaceDbModelsStoreValue = value})

export const spaceDbModelsStoreAsArray = derived( spaceDbModelsStore, $spaceDbModelsStore => Object.values($spaceDbModelsStore) )

export const spaceIdsNotFoundStore = writable( [] as number[] );


/* Thing-related stores and subscriptions. */

export const thingDbModelsStore = writable( {} as { [id: number]: ThingDbModel } )

let thingDbModelsStoreValue: { [id: number]: ThingDbModel }
thingDbModelsStore.subscribe(value => {thingDbModelsStoreValue = value})

export const thingDbModelsStoreAsArray = derived( thingDbModelsStore, $thingDbModelsStore => Object.values($thingDbModelsStore) )

export const thingIdsNotFoundStore = writable( [] as number[] )


/**
 * Add Graph DB models to the stores.
 * @param  {Type} models - The Graph DB models to add to the store.
 */
function updateDbModelStore<Type extends GraphDbModel>( models: Type | Type[] ): void {
    // If necessary, pack a single supplied model in an array for processing.
    if (!("length" in models)) models = [models]
    
    // Determine which store to update based on construct type.
    let store: Writable<{ [id: number]: GraphDbModel }>
    if ( models.length && isDirectionDbModel(models[0]) ) {
        store = directionDbModelsStore
    } else if ( models.length && isSpaceDbModel(models[0]) ) {
        store = spaceDbModelsStore
    } else if ( models.length && isThingDbModel(models[0]) ) {
        store = thingDbModelsStore
    } else {
        return
    }

    // Update the store with each supplied DB model.
    models.forEach((model) => {
        store.update( (current) => { current[model.id as number] = model; return current } )
    })
}


/**
 * Add Graph construct IDs to the stores.
 * @param  {"Direction" | "Space" | "Thing"} constructName - The name of the construct type.
 * @param  {number | number[]} ids - The construct IDs to add to the stores.
 */
function updateIdStore(
    constructName: "Direction" | "Space" | "Thing" | "ThingNotFound",
    ids: number | number[]
): void {
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

    // Update the store with each supplied ID.
    ids.forEach((id) => {
        store.update( (current) => { if (!current.includes(id)) current.push(id); return current } )
    })
}


/**
 * Trim Thing store down to their maximum allowed size.
 */
function trimThingStore(): void {
    thingDbModelsStore.update( (current) => {
        const thingDbModelsStoreAsArray = Object.values(current)
        const thingIdsInOrderInstantiated = thingDbModelsStoreAsArray
            //.sort((a, b) => b.whenModelInstantiated.getTime() - a.whenModelInstantiated.getTime())
            .map(thing => thing.id)
        
        const trimmedThingIds = thingIdsInOrderInstantiated.slice(0, maxThingsToStore)

        const filteredThingDbModelsStore = Object.fromEntries(
            Object.entries(current).filter(
               (keyVal) => trimmedThingIds.map(id => Number(id)).includes(Number(keyVal[0]))
            )
        )

        return filteredThingDbModelsStore
    } )
}


/**
 * Check whether a Graph DB model is in the store (by ID).
 * @param  {"Direction" | "Space" | "Thing"} constructName - The name of the construct type.
 * @param  {number | number[]} id - The construct IDs to check.
 */
export function graphDbModelInStore(
    constructName: "Direction" | "Space" | "Thing",
    id: number
): boolean {
    // Determine which store to check based on construct name.
    const storeValue = {
        "Direction": directionDbModelsStoreValue,
        "Space": spaceDbModelsStoreValue,
        "Thing": thingDbModelsStoreValue
    }[constructName]

    // Determine if the construct ID is in the store.
    return id in storeValue ? true : false
}


/**
 * Fetch Graph DB models from the API, then add them to the stores.
 * @param  {"Direction" | "Space" | "Thing"} constructName - The name of the construct type.
 * @param  {number | number[]} ids - The construct IDs to fetch and store.
 * @param  allowUpdating - Whether to update or skip DB models that are already in the store.
 */
export async function storeGraphDbModels<Type extends GraphDbModel>(
    constructName: "Direction" | "Space" | "Thing",
    ids?: number | number[],
    allowUpdating = false
): Promise< Type[] > {
    // Determine which store to check based on construct name.
    const storeValue = {
        "Direction": directionDbModelsStoreValue,
        "Space": spaceDbModelsStoreValue,
        "Thing": thingDbModelsStoreValue
    }[constructName]

    let idsToQuery: number[] = []
    let queriedInstances: Type[]
    
    // If no IDs were provided, fetch all instances of this Db model.
    if (typeof ids === "undefined") {
        queriedInstances = await graphDbModels(constructName) as Type[]

    // Else, if IDs *were* provided, fetch instances based on the IDs.
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
        queriedInstances = await graphDbModels(constructName, idsToQuery) as Type[]
    }

    // Update the store with these instances.
    updateDbModelStore(queriedInstances)
    // Update the IDs Not Found store with any IDs that weren't fetched.
    if (!(typeof ids === "undefined")) {
        const idsFound = queriedInstances.map(x => x.id) as number[]
        const idsNotFound = idsToQuery.filter( x => !idsFound.includes(x) )
        updateIdStore(constructName, idsNotFound)
    }

    // If the construct is "Thing", trim the store to the maximum allowed size.
    if (constructName === "Thing") trimThingStore()

    // Return the array of constructs.
    return queriedInstances
}


/**
 * Remove Graph DB models from the stores.
 * @param  {"Direction" | "Space" | "Thing"} constructName - The name of the construct type.
 * @param  {number | number[]} ids - The IDs of the DB models to remove from the store.
 */
export async function unstoreGraphDbModels(
    constructName: "Direction" | "Space" | "Thing",
    ids: number | number[]
): Promise<void> {
    // Determine which store to update based on construct name.
    const store: Writable<{[id: number]: GraphDbModel}> = {
        "Direction": directionDbModelsStore,
        "Space": spaceDbModelsStore,
        "Thing": thingDbModelsStore
    }[constructName]

    // Convert single IDs into arrays for processing (if needed).
    if ( typeof ids === "number" ) ids = [ids]

    // Update the store with each supplied id.
    ids.forEach((id) => {
        store.update( (current) => { delete current[id]; return current } )
    })
}


/**
 * Clear a Graph DB model store.
 * @param  {"Direction" | "Space" | "Thing"} constructName - The name of the construct type.
 */
export async function clearGraphDbModelStore(constructName: "Direction" | "Space" | "Thing"): Promise<void> {
    // Determine which store to clear based on construct name.
    const store: Writable<{[id: number]: GraphDbModel}> = {
        "Direction": directionDbModelsStore,
        "Space": spaceDbModelsStore,
        "Thing": thingDbModelsStore
    }[constructName]

    // Clear the store.
    store.set({})
}















/**
 * Get Graph constructs based on the DB models in the stores.
 * @param  {"Direction" | "Space" | "Thing"} constructName - The name of the construct type.
 * @param  {number | number[]} ids - The IDs of the constructs to retrieve from the stores.
 */
export function getGraphConstructs<Type extends GraphConstruct>(/////////////////// REBUILD AS GET GRAPH CONSTRUCTS
    constructName: "Direction" | "Space" | "Thing",
    ids: number
): Type | null
export function getGraphConstructs<Type extends GraphConstruct>(
    constructName: "Direction" | "Space" | "Thing",
    ids: number[]
): Type[]
export function getGraphConstructs<Type extends GraphConstruct>(
    constructName: "Direction" | "Space" | "Thing",
    ids: number | number[]
): Type[] | Type | null {
    // Determine which store to get DbModel from based on construct name.
    let storeValue: { [id: number]: GraphDbModel }
    if (constructName === "Direction") {
        storeValue = directionDbModelsStoreValue
    } else if (constructName === "Space") {
        storeValue = spaceDbModelsStoreValue
    } else {
        storeValue = thingDbModelsStoreValue
    }





    
    // For single IDs, return a construct based on the the stored DB model, or
    // null if there isn't one stored.
    if (typeof ids === "number") {
        const output = graphDbModelInStore(constructName, ids) ?
            (
                constructName === "Direction" ? new Direction(storeValue[ids] as DirectionDbModel) :
                constructName === "Space" ? new Space(storeValue[ids] as SpaceDbModel) :
                new Thing(storeValue[ids] as ThingDbModel)
            ) as Type :
            null
        return output
        
    // For an array of IDs, return an array of constructs based on the the stored
    // DB models that match.
    } else {
        const output: Type[] = []
        for (const id of ids) {
            if (graphDbModelInStore(constructName, id)) output.push(
                (
                    constructName === "Direction" ? new Direction(storeValue[id] as DirectionDbModel) :
                    constructName === "Space" ? new Space(storeValue[id] as SpaceDbModel) :
                    new Thing(storeValue[id] as ThingDbModel)
                ) as Type
            )
        }
        return output
    }
}