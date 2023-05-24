import type { Direction, Space, Thing } from "$lib/models/constructModels"
import type { GraphConfig, OddHalfAxisId } from "$lib/shared/constants"
import { get } from "svelte/store"
import { sessionSpecificFetch as fetch } from "$lib/db/sessionSpecificFetch"
import { newFileCreationStore } from "$lib/stores"


/*
 * Create a new Direction.
 */
export async function createDirection(
    directionText: string,
    objectText: string,
    oppositeDirectionId: number | null
): Promise<number | false> {
    // Post to the create-Space API.
    const res = await fetch(
        `api/db/graphManipulation/createDirection`,
        {
            method: "POST",

            body: JSON.stringify({
                directionText: directionText,
                objectText: objectText,
                oppositeDirectionId: oppositeDirectionId
            })
        }
    )

    // Report on the response.
    if (res.ok) {
        const newSpace = Number(await res.json() as string)
        return newSpace
    } else {
        res.text().then(text => {throw Error(text)})
        return false
    }
}

/*
 * Update an existing Direction.
 */
export async function updateDirection(
    directionId: number,
    directionText: string,
    nameForObjects: string,
    oppositeId: number | null
): Promise<boolean> {
    // Post to the update-Direction API.
    const res = await fetch(
        `api/db/graphManipulation/updateDirection`,
        {
            method: "POST",

            body: JSON.stringify({
                directionId: directionId,
                directionText: directionText,
                nameForObjects: nameForObjects,
                oppositeId: oppositeId
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


export async function reorderDirection(
    directionId: number,
    newIndex: number
): Promise< boolean > {
    // Post to the reorder-Direction API.
    const res = await fetch(
        `api/db/graphManipulation/reorderDirection`,
        {
            method: "POST",
            body: JSON.stringify({
                directionId: directionId,
                newIndex: newIndex
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
 * Delete a Direction.
 */
export async function deleteDirection( directionIdToDelete: number ): Promise<boolean> {
    // Post to the delete-Direction API.
    const res = await fetch(
        `api/db/graphManipulation/deleteDirection`,
        {
            method: "POST",
            body: JSON.stringify({
                spaceIdToDelete: directionIdToDelete
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
 * Create a new Space.
 */
export async function createSpace(
    spaceText: string,
    halfAxisIdsAndDirections: [OddHalfAxisId, (Direction | null)][]
): Promise<number | false> {
    // Post to the create-Space API.
    const res = await fetch(
        `api/db/graphManipulation/createSpace`,
        {
            method: "POST",

            body: JSON.stringify({
                spaceText: spaceText,
                halfAxisIdsAndDirections: halfAxisIdsAndDirections
            })
        }
    )

    // Report on the response.
    if (res.ok) {
        const newSpace = Number(await res.json() as string)
        return newSpace
    } else {
        res.text().then(text => {throw Error(text)})
        return false
    }
}


/*
 * Update an existing Space.
 */
export async function updateSpace(
    spaceId: number,
    spaceText: string,
    halfAxisIdsAndDirections: [OddHalfAxisId, (Direction | null)][]
): Promise<boolean> {
    // Post to the update-Space API.
    const res = await fetch(
        `api/db/graphManipulation/updateSpace`,
        {
            method: "POST",

            body: JSON.stringify({
                spaceId: spaceId,
                spaceText: spaceText,
                halfAxisIdsAndDirections: halfAxisIdsAndDirections
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

export async function reorderSpace(
    spaceId: number,
    newIndex: number
): Promise< boolean > {
    // Post to the reorder-Space API.
    const res = await fetch(
        `api/db/graphManipulation/reorderSpace`,
        {
            method: "POST",
            body: JSON.stringify({
                spaceId: spaceId,
                newIndex: newIndex
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
 * Delete a Space.
 */
export async function deleteSpace( spaceIdToDelete: number ): Promise<boolean> {
    // Post to the delete-Space API.
    const res = await fetch(
        `api/db/graphManipulation/deleteSpace`,
        {
            method: "POST",
            body: JSON.stringify({
                spaceIdToDelete: spaceIdToDelete
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
 * From a starting Thing, create a related Thing.
 */
export async function createNewRelatedThing(
    thingIdToRelateFrom: number, directionId: number, text: string, defaultSpace: Space
): Promise<Thing | false> {
    // Post to the create-new-related-Thing API.
    const res = await fetch(
        `api/db/graphManipulation/createNewRelatedThing`,
        {
            method: "POST",

            body: JSON.stringify({
                thingIdToRelateFrom: thingIdToRelateFrom,
                directionId: directionId,
                text: text,
                defaultSpace: defaultSpace
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
 * Update a Thing's text.
 */
export async function updateThingText(
    thingId: number, text: string
): Promise<boolean> {
    // Post to the update-Thing-text API.
    const res = await fetch(
        `api/db/graphManipulation/updateThingText`,
        {
            method: "POST",

            body: JSON.stringify({
                thingId: thingId,
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
 * Update a Thing's Perspective text.
 */
export async function updateThingPerspectiveText(
    pThingId: number,
    thingId: number,
    text: string
): Promise<boolean> {
    // Post to the update-Thing-Perspective-text API.
    const res = await fetch(
        `api/db/graphManipulation/updateThingPerspectiveText`,
        {
            method: "POST",

            body: JSON.stringify({
                pThingId: pThingId,
                thingId: thingId,
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
 * Update a Thing's default Space.
 */
export async function updateThingDefaultSpace(
    thingId: number, spaceId: number
): Promise<boolean> {
    // Post to the update-Thing-default-Space API.
    const res = await fetch(
        `api/db/graphManipulation/updateThingDefaultSpace`,
        {
            method: "POST",

            body: JSON.stringify({
                thingId: thingId,
                spaceId: spaceId
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
 * Add a Note to a Thing.
 */
export async function addNoteToThingOrGetExistingNoteId( thingId: number ): Promise<number | false> {
    let newNoteId: number | false = false

    // Post to the add-Note-to-Thing API.
    const res = await fetch(
        `api/db/graphManipulation/addNoteToThingOrGetExistingNoteId`,
        {
            method: "POST",
            body: JSON.stringify({
                thingId: thingId
            })
        }
    )

    // Report on the response.
    if (res.ok) {
        newNoteId = await res.json()
    } else {
        res.text().then(text => {throw Error(text)})
    }

    return newNoteId
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




export async function reorderRelationship(
    sourceThingId: number,
    destThingDirectionId: number,
    destThingId: number,
    newIndex: number
): Promise< boolean > {
    // Post to the reorder-Relationship API.
    const res = await fetch(
        `api/db/graphManipulation/reorderRelationship`,
        {
            method: "POST",
            body: JSON.stringify({
                sourceThingId: sourceThingId,
                destThingDirectionId: destThingDirectionId,
                destThingId: destThingId,
                newIndex: newIndex
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