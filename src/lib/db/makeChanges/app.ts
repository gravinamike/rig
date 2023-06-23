import type { GraphConfig } from "$lib/shared/constants"
import { get } from "svelte/store"
import { sessionSpecificFetch as fetch } from "$lib/db/sessionSpecificFetch"
import { newFileCreationStore } from "$lib/stores"



/*
 * Set the database listening port.
 */
export async function setDbPort(): Promise<void> {
    await fetch("/api/db/dbPort", {
        method: "POST"
    })
}

/*
 * Set the base Graphs folder.
 */
export async function setGraphsBaseFolder(): Promise<void> {
    await fetch("/api/file/graphsBaseFolder", {
        method: "POST"
    })
}




/*
 * Save the application configuration.
 */
export async function saveAppConfig(): Promise<void> {
    await fetch("/api/file/appConfig", {
        method: "POST"
    })
}




/*
 * Save the Graph configuration.
 */
export async function saveGraphConfig(graphConfig: GraphConfig): Promise<void> {
    await fetch("/api/file/graphConfig", {
        method: "POST",
        body: JSON.stringify(graphConfig, null, 4)
    })
}


export async function createGraph( newGraphName: string ): Promise<boolean> {
    const username = get(newFileCreationStore).username

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