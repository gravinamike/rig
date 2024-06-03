// Import SvelteKit framework resources.
import { minimumEndpointPathRequestIntervals } from "$lib/shared/constants"
import { removeItemFromArray } from "$lib/shared/utility"
import { writable} from "svelte/store"



/* API stores. */

// Recently-called-endpoints store.
export const recentlyCalledEndpointsStore = writable( [] as string[] )






export function registerRecentlyCalledEndpoint(endpointPath: string) {
    let unregisterDelay = 0
    for (const [endpointPathStart, interval] of Object.entries(minimumEndpointPathRequestIntervals)) {
        if (endpointPath.startsWith(endpointPathStart)) unregisterDelay = interval
    }

    if (unregisterDelay > 0) {
        recentlyCalledEndpointsStore.update(
            current => { current = [...current, endpointPath]; return current }
        )

        setTimeout(() => { unRegisterRecentlyCalledEndpoint(endpointPath) }, unregisterDelay)
    }

    
    
}

export function unRegisterRecentlyCalledEndpoint(endpointPath: string) {
    recentlyCalledEndpointsStore.update(
        current => { removeItemFromArray(current, endpointPath); return current }
    )
}