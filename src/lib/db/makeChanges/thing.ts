import type { Space, Thing } from "$lib/models/constructModels"
import { sessionSpecificFetch as fetch } from "$lib/db/sessionSpecificFetch"



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
 * Update a Thing's default content viewer.
 */
export async function updateThingDefaultContentViewer(
    thingId: number, defaultContentViewer: "notes" | "outline" | "attachments"
): Promise<boolean> {
    // Post to the update-Thing-default-Space API.
    const res = await fetch(
        `api/db/graphManipulation/updateThingDefaultContentViewer`,
        {
            method: "POST",

            body: JSON.stringify({
                thingId: thingId,
                defaultContentViewer: defaultContentViewer
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