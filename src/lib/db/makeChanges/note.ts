import { sessionSpecificFetch as fetch } from "$lib/db/sessionSpecificFetch"



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