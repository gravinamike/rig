import type { Thing } from "$lib/models/graphModels"
import type { GraphConfig } from "$lib/shared/constants"


/*
 * From a starting Thing, create a related Thing.
 */
export async function createNewRelatedThing(
    thingIdToRelateFrom: number, directionId: number, text: string
): Promise<Thing | false> {
    // Post to the create-new-related-Thing API.
    const res = await fetch(
        `api/db/graphManipulation/createNewRelatedThing`,
        {
            method: "POST",

            body: JSON.stringify({
                thingIdToRelateFrom: thingIdToRelateFrom,
                directionId: directionId,
                text: text
            })
        }
    )

    // Report on the response.
    if (res.ok) {
        const newRelatedThing = await res.json() as Thing
        return newRelatedThing
    } else {
        res.text().then(text => {throw Error(text)})
        return false
    }
}

/*
 * Add a Note to a Thing.
 */
export async function addNoteToThing( thingId: number ): Promise<boolean> {
    // Post to the add-Note-to-Thing API.
    const res = await fetch(
        `api/db/graphManipulation/addNoteToThing`,
        {
            method: "POST",
            body: JSON.stringify({
                thingId: thingId
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

/*
 * Update the text of a Note.
 */
export async function updateNote( noteId: number, text: string ): Promise<boolean> {
    // Post to the update-Note API.
    const res = await fetch(
        `api/db/graphManipulation/updateNote`,
        {
            method: "POST",
            body: JSON.stringify({
                noteId: noteId,
                text: text
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

/*
 * Add a Folder to a Thing.
 */
export async function addFolderToThing( thingId: number ): Promise<boolean> {
    // Post to the add-folder-to-Thing API.
    const res = await fetch(
        `api/db/graphManipulation/addFolderToThing`,
        {
            method: "POST",
            body: JSON.stringify({
                thingId: thingId
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

/*
 * Delete a Thing.
 */
export async function deleteThing( thingIdToDelete: number ): Promise<boolean> {
    // Post to the delete-Thing API.
    const res = await fetch(
        `api/db/graphManipulation/deleteThing`,
        {
            method: "POST",
            body: JSON.stringify({
                thingIdToDelete: thingIdToDelete
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


/*
 * Create a Relationship between two targets (which may be Things or Relationship stems).
 */
export async function createNewRelationship(sourceThingId: number, destThingId: number, directionId: number): Promise<boolean> {
    // Post to the create-new Relationship API.
    const res = await fetch(
        `api/db/graphManipulation/createNewRelationship`,
        {
            method: "POST",

            body: JSON.stringify({
                sourceThingId: sourceThingId,
                destThingId: destThingId,
                directionId: directionId
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


/*
 * Update the Direction of a set of Relationships.
 */
export async function updateRelationships( relationshipInfos: {sourceThingId: number, destThingId: number, directionId: number}[] ): Promise<boolean> {
    // Post to the update-Relationships API.
    const res = await fetch(
        `api/db/graphManipulation/updateRelationships`,
        {
            method: "POST",
            body: JSON.stringify({
                relationshipInfos: relationshipInfos
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


/*
 * Delete a Thing.
 */
export async function deleteRelationship( sourceThingId: number, destThingId: number ): Promise<boolean> {
    // Post to the delete-Thing API.
    const res = await fetch(
        `api/db/graphManipulation/deleteRelationship`,
        {
            method: "POST",
            body: JSON.stringify({
                sourceThingId: sourceThingId,
                destThingId: destThingId
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


/*
 * Set the Unigraph folder.
 */
export async function setUnigraphFolder(folderName: string): Promise<void> {
    await fetch("/api/file/unigraphFolder", {
        method: "POST",
        body: JSON.stringify(folderName)
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


/*
 * Mark a Thing as visited.
 */
export async function markThingsVisited( thingIds: number | number[] ): Promise<boolean> {
    if (typeof thingIds === "number") thingIds = [thingIds]

    // Post to the mark-Things-visited API.
    const res = await fetch(
        `api/db/graphManipulation/markThingsVisited`,
        {
            method: "POST",
            body: JSON.stringify({
                thingIdsToMarkVisited: thingIds
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


/*
 * Mark a Note as modified.
 */
export async function markNotesModified( noteIds: number | number[] ): Promise<boolean> {
    if (typeof noteIds === "number") noteIds = [noteIds]

    // Post to the mark-Notes-modified API.
    const res = await fetch(
        `api/db/graphManipulation/markNotesModified`,
        {
            method: "POST",
            body: JSON.stringify({
                noteIdsToMarkModified: noteIds
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




export async function createGraph( newGraphName: string ): Promise<boolean> {
    // Post to the create-new-Graph API.
    const res = await fetch(
        `api/file/createGraph`,
        {
            method: "POST",
            body: JSON.stringify({
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