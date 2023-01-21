import { get } from "svelte/store"
import { urlStore } from "$lib/stores"


/**
 * URL-hash-to-object method.
 * 
 * Converts a URL hash string to an object with the same keys and values.
 * @param hash - A URL hash string.
 * @returns - An object with the same keys and values as the URL hash string.
 */
export function urlHashToObject(hash: string): { [key: string]: string } {
    // If the hash string contains no info, return an empty object.
    if ( !hash.length || (hash.length === 1 && hash[0] === "#") ) return {}

    // Remove the leading hash character if necessary.
    const hashWithoutHashCharacter =
        hash[0] === "#" ? hash.slice(1) :
        hash

    // Parse the hash string.
    const parsedObject: { [key: string]: string } =
        // Split the hash string into key-value pairs.
        hashWithoutHashCharacter.split("&")
        // Convert each key-value pair into a [key, value] array.
        .map( kVPair => kVPair.split("=") )
        // Combine the [key, value] pairs in the array into an object.
        .reduce(
            (previousValues, [key, value]) => ({ ...previousValues, [key]: value }),
            {}
        )

    // Return the parsed object.
    return parsedObject
}

/**
 * Update-URL-hash method.
 * 
 * 
 * @param paramsToChange - Object containing key-value pairs to update.
 */
export function updateUrlHash(paramsToChange: { [key: string]: string | null }) {
    // Array containing parameter keys which are allowed in the hash. Other
    // keys will be ignored/removed.
    const allowedHashKeys = ["graph", "thingId", "spaceId"]

    // Get the reactive URL string.
    const url = get(urlStore)
    
    // Parse the URL string to an object.
    const urlHashParams = urlHashToObject(url.hash)

    // Update the object's entries based on the parameters-to-change object.
    for (const [key, value] of Object.entries(paramsToChange)) {
        if (value) urlHashParams[key] = value
    }

    // Filter out entries with non-allowed keys or null values, and set the URL
    // hash based on the object.
    const urlHashParamsAsArray = Object.entries(urlHashParams)
        .filter(keyValue => allowedHashKeys.includes(keyValue[0]) && !!keyValue[1])
    url.hash = urlHashParamsAsArray.map(([key, value]) => `${key}=${value}`).join("&")
    
    // Set the document's URL to the updated URL.
    document.location.href = url.href
}