// Import session-specific fetch.
import { sessionSpecificFetch as fetch } from "$lib/db/sessionSpecificFetch"



/**
 * Add-Note-to-Thing-(or-get-existing-Note-ID) method.
 * 
 * If the Thing has no Note, creates one. Otherwise, gets the ID of the
 * existing Note.
 * @param thingId - The ID of the Thing.
 * @returns - Either the ID of the Note, or false if there was an error.
 */
export async function addNoteToThingOrGetExistingNoteId( thingId: number ): Promise<number | false> {
    // Initialize the new Note ID to false.
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

    // Either get the new-Note-ID from the response, or throw an error.
    if (res.ok) {
        newNoteId = await res.json()
    } else {
        res.text().then(text => {throw Error(text)})
    }

    // Return the new Note ID (or false if there was an error).
    return newNoteId
}

/**
 * Update-Note method.
 * 
 * Set the text of a Note by ID.
 * @param noteId - The ID of the Note to modify.
 * @param text - The new Note text.
 * @returns - Whether or not the update-Note operation was successful.
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

/**
 * Mark-Note-modified method.
 * 
 * Updates the "whenmodded" field of the Note record to indicate when the Note
 * was last modified.
 * @param noteIds - The IDs of the Notes to mark as modified.
 * @returns 
 */
export async function markNotesModified( noteIds: number | number[] ): Promise<boolean> {
    // Package individual Note IDs into an array for processing.
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