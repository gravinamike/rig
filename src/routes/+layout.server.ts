// Import types.
import type { LayoutServerLoad } from "./$types"


export const load: LayoutServerLoad = async ({ fetch, locals }) => {
    // If no log file exists (and one is called for), create it.
    await fetch(
        `api/file/createLogFolderAndFileIfNeeded`,
        {
            method: "POST"
        }
    )

    // Pass the app's local variables on to +layout.svelte.
    return {
        ...locals
    }
}