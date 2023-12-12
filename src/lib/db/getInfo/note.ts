// Import types.
import type { NoteSearchListItemDbModel } from "$lib/models/dbModels"

// Import session-specific fetch.
import { sessionSpecificFetch as fetch } from "$lib/db/sessionSpecificFetch"

// Import models.
import { NoteSearchListItem } from "$lib/models/constructModels"


/**
 * Get-Note-search-list-items method.
 * 
 * Retrieves an array of Note search-list items from the back-end database.
 * @param noteIds - The IDs of the desired Notes.
 * @returns - An array of Note search-list items based on those IDs.
 */
export async function getNoteSearchListItems(noteIds?: number[]): Promise<NoteSearchListItem[] | false> {
    const res =
        // If no IDs were specified, query the Note search list item API for all items.
        noteIds === undefined ? await fetch(`/api/db/graphConstructs/noteSearchListItems-all`) :
        // Otherwise, query only for the specified IDs.
        await fetch(`/api/db/graphConstructs/noteSearchListItems-${noteIds}`)

    // If the response is ok,
    if (res.ok) {
        // Parse the response as an array of Note search list item DB models.
        const models = await res.json() as NoteSearchListItemDbModel[]

        // Create a corresponding array of Note search list items.
        const noteSearchList: NoteSearchListItem[] = []
        for (const model of models) {
            noteSearchList.push( new NoteSearchListItem(model) )
        }

        // Return that array.
        return noteSearchList

    // Handle errors if needed.
    } else {
        res.text().then(text => {throw Error(text)})
        return false
    }
}