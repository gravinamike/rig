// Import types.
import type { HandleClientError } from "@sveltejs/kit"

import { get } from "svelte/store"
import { loggerStore, openGraphStore, userIdStore } from "$lib/stores"
const logger = get(loggerStore)



/**
 * Server unexpected-error hook.
 * 
 * All unexpected errors (those errors not thrown with the SvelteKit `error` function) on the
 * client pass through this hook. It allows such errors to be logged and also stripped of any
 * sensitive information (like stack traces) before being passed on.
 * @param error - The error that caused the hook to be invoked.
 * @param event - The navigation event that caused the error.
 * @returns - An object conforming to the application's error interface.
 */
export const handleError: HandleClientError = async ({ error, event }) => {
	let errorMessage: string

	try {
		// Get the error message from the error.
		errorMessage = `An unexpected error happened during loading/rendering: ${(error as {message: string}).message}`
			
		// Log the error.
		logger.error(
			{
				userName: get(userIdStore),
				graphName: get(openGraphStore),
				route: event.route.id,
				msg: errorMessage
			}
		)
	} catch {
		// On any error in the above try block, fall back to a generic error message and skip
		// logging.
		errorMessage =
			"An unexpected error occurred, and another error occurred while attempting to handle it in the client-side hooks."
	}

	// Return an application error object.
	return {
		message: errorMessage
	}
}