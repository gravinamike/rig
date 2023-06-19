// Import types.
import type { NoteSearchListItemDbModel } from "$lib/models/dbModels"

// Import session-specific fetch.
import { sessionSpecificFetch as fetch } from "$lib/db/sessionSpecificFetch"

// Import models.
import { NoteSearchListItem } from "$lib/models/constructModels"


/*
 * Get a search list of Notes.
 */
export async function noteSearchListItems(noteIds?: number[]): Promise<NoteSearchListItem[] | false> {
    const res = noteIds === undefined ?
        await fetch(`api/db/graphConstructs/noteSearchListItems-all`) :
        await fetch(`api/db/graphConstructs/noteSearchListItems-${noteIds}`)

    if (res.ok) {
        const models = await res.json() as NoteSearchListItemDbModel[]
        const noteSearchList: NoteSearchListItem[] = []
        for (const model of models) {
            noteSearchList.push( new NoteSearchListItem(model) )
        }
        return noteSearchList
    } else {
        res.text().then(text => {throw Error(text)})
        return false
    }
}