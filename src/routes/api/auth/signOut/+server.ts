import type { RequestHandler } from "@sveltejs/kit"
import { error } from "@sveltejs/kit"
import { parse, serialize } from "cookie"
import { removeSession } from "$lib/server/auth"


/**
 * Get method for sign-out endpoint.
 *
 * @param request - The request object (including the session cookie).
 * @returns - The response object (including a "null" set-cookie header).
 */
export const GET: RequestHandler = async ({ request }) => {
    // Parse the cookie.
    const cookieObject = parse(request.headers.get("cookie") || "")

    // If the cookie includes a session ID,
    if ( cookieObject.session_id ) {
        // Remove the session object with that ID.
        await removeSession(cookieObject.session_id)

        // Create a response with a "null" set-cookie header.
        const response = new Response()
        response.headers.set(
            "Set-Cookie",
            serialize(
                "session_id",
                "",
                {
                    path: "/",
                    expires: new Date(0)
                }
            )
        )

        // Return the response.
        return response
    }

    // If the cookie doesn't contain a session ID, throw an error.
    throw error(401, "Sign-out attempt failed (no session ID in the cookie).")
}