import type { Subscriber, Unsubscriber } from "svelte/store"
import { writable, derived } from "svelte/store"


/**
 * Create-URL-store method.
 * 
 * Creates a reactive URL store. This allows the application to automatically
 * update its state in response to changes in the URL.
 * @param url - Default URL to use in case the window is not defined yet.
 * @returns - Object containing subscribe method to new reactive URL store.
 */
function createUrlStore(url: URL = new URL("https://www.example.com")): {

    subscribe: (
        this: void,
        run: Subscriber<URL>,
        invalidate?: ((value?: URL) => void) | undefined
    ) => Unsubscriber
    
} {

    // If there's no window defined yet,
    if (typeof window === "undefined") {

        // Return the subscribe method for a store containing the supplied URL.
        const { subscribe } = writable(url)
        return { subscribe }

    } else {

        // Set up a store to contain the window's URL string, and a method to
        // update it.
        const urlStringStore = writable(window.location.href)
        const updateUrlStringStore = () => urlStringStore.set(window.location.href)

        // Replace the native push/replace methods for the window's URL history
        // with versions that also update the URL store.
        const nativePushState = history.pushState
        history.pushState = function (...args) {
            nativePushState.apply(this, args)
            updateUrlStringStore()
        }
        const nativeReplaceState = history.replaceState
        history.replaceState = function (...args) {
            nativeReplaceState.apply(this, args)
            updateUrlStringStore()
        }

        // Make the window-history-change and window-URL-hash-change events
        // update the URL store.
        window.addEventListener("popstate", updateUrlStringStore)
        window.addEventListener("hashchange", updateUrlStringStore)

        // Set up a derived store that contains a URL version of the URL string
        // store, and return its subscribe method.
        const urlStore = derived(urlStringStore, ($url) => new URL($url))
        return { subscribe: urlStore.subscribe }

    }

}

export const urlStore = createUrlStore()