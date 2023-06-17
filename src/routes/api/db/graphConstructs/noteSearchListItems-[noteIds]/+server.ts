import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import { queryNoteSearchList } from "$lib/server/db"


export const GET: RequestHandler = async ({ params }) => {
    try {
        const noteIds = params.noteIds || ""

        const noteSearchList = noteIds === "all" ?
            await queryNoteSearchList(null) :
            await queryNoteSearchList(noteIds.split(",").map(x => Number(x)))
            
        return new Response(JSON.stringify(noteSearchList))

    } catch(err) {
        throw error(500, `A server error occurred while attempting to get Note search list: ${err}`)
    }
}