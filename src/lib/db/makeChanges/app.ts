// Import types.
import type { GraphConfig } from "$lib/shared/constants"

// Import basic framework resources.
import { get } from "svelte/store"

// Import session-specific fetch.
import { sessionSpecificFetch as fetch } from "$lib/db/sessionSpecificFetch"

// Import stores.
import { newGraphFileCreationStore } from "$lib/stores"



/**
 * Set-database-listening-port method.
 * 
 * Sets the port which the app uses to communicate with the back-end database,
 * based on the configuration file.
 */
export async function setDbPort(): Promise<void> {
    await fetch("/api/db/dbPort", {
        method: "POST"
    })
}

/**
 * Set-base-Graphs-folder method.
 * 
 * Sets the base folder path that Graphs are stored in, based on the
 * configuration file.
 */
export async function setGraphsBaseFolder(): Promise<void> {
    await fetch("/api/file/graphsBaseFolder", {
        method: "POST"
    })
}


/**
 * Save-app-config method.
 * 
 * Saves the front-end application configuration settings to a file on the
 * server.
 */
export async function saveAppConfig(): Promise<void> {
    await fetch("/api/file/appConfig", {
        method: "POST"
    })
}

/**
 * Save-Graph-config method.
 * 
 * Saves the front-end Graph configuration settings to a file on the server.
 */
export async function saveGraphConfig(graphConfig: GraphConfig): Promise<void> {
    await fetch("/api/file/graphConfig", {
        method: "POST",
        body: JSON.stringify(graphConfig, null, 4)
    })
}


/**
 * Create-Graph method.
 * 
 * Creates a new Graph file on the server.
 * @param newGraphName - The name of the Graph to be created.
 * @returns - Whether or not the create-Graph operation was successful.
 */
export async function createGraph( newGraphName: string ): Promise<boolean> {
    // Get the username from the new-Graph-file-creation-store.
    const username = get(newGraphFileCreationStore).username

    // Post to the create-new-Graph API.
    const res = await fetch(
        `api/file/createGraph`,
        {
            method: "POST",
            body: JSON.stringify({
                username: username,
                newGraphName: newGraphName
            })
        }
    )

    // Report on the response.
    if (res.ok) {
        return true
    } else {
        res.text().then(text => {throw Error(text)})
        return false
    }
}