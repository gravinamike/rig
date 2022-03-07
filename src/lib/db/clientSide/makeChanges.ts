/*
 * From a starting Thing, create a related Thing.
 */
export async function createNewRelatedThing(
    thingIdToRelateFrom: number, directionId: number, text: string
): Promise<boolean> {
    // Post to the create-new-related-Thing API.
    const res = await fetch(
        `api/graphManipulation/createNewRelatedThing`,
        {
            method: "POST",

            body: JSON.stringify({
                thingIdToRelateFrom: thingIdToRelateFrom,
                directionId: directionId,
                text: text
            })
        }
    )

    // If the response is ok, return true.
    if (res.ok) {
        return true

    // Handle errors if needed.
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
        `api/graphManipulation/addNoteToThing`,
        {
            method: "POST",
            body: JSON.stringify({
                thingId: thingId
            })
        }
    )

    // If the response is ok, return true.
    if (res.ok) {
        return true

    // Handle errors if needed.
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
        `api/graphManipulation/addFolderToThing`,
        {
            method: "POST",
            body: JSON.stringify({
                thingId: thingId
            })
        }
    )

    // If the response is ok, return true.
    if (res.ok) {
        return true

    // Handle errors if needed.
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
        `api/graphManipulation/deleteThing`,
        {
            method: "POST",
            body: JSON.stringify({
                thingIdToDelete: thingIdToDelete
            })
        }
    )

    // If the response is ok, return true.
    if (res.ok) {
        return true

    // Handle errors if needed.
    } else {
        res.text().then(text => {throw Error(text)})
        return false
    }
}