import type { RequestHandler } from "@sveltejs/kit"
import type { CookieSerializeOptions } from "cookie"
import { error } from "@sveltejs/kit"
import { serialize } from "cookie"
import { getUserByUsername, createNewSession, validatePassword } from "$lib/server/auth"


/**
 * Post method for sign-in endpoint.
 *
 * @param body - User-credentials object.
 * @returns - Server response object, including set-cookie header on success.
 */
export const POST: RequestHandler = async ({ request }) => {
    // Retrieve the user-credentials object by username.
    const body = await request.json()
    const user = await getUserByUsername(body.username)

    // Check the supplied password matches the user's hashed password.
    const passwordIsValid =
        user ? await validatePassword(body.password, user.hashedPassword) :
        false

    // If the user asked to remain signed in, set a persistent cookie (with
    // maxAge). Otherwise set a session cookie.
    const cookieOptions: CookieSerializeOptions = {
        // If `path` is "/", cookie will be sent for every request.
        path: "/",
        // `httpOnly` should be true so client-side JS can't access the cookie
        // (which is a security issue).
        httpOnly: true,
        // `sameSite` should be "strict" to prevent CSRF attacks.
        sameSite: "strict",
        // `secure` should be true, so cookie is only sent for https requests
        // to prevent man-in-the-middle attacks.
        secure: process.env.NODE_ENV === "production"
    }
    // Keep the session active for a week if the user wants to stay signed in.
    if (body.rememberUser) cookieOptions["maxAge"] = 60 * 60 * 24 * 7

    // If the user isn't registered or the password is incorrect,
    if ( !user || !passwordIsValid ) {    
        // Return an error response.
        throw error(401, "Incorrect user or password")

    // Otherwise,
    } else {
        // Create a new session using the username.
        const { id } = await createNewSession(body.username)

        // Create a response with a set-cookie header for the new session.
        const response = new Response(JSON.stringify(
            {
                message: "Signed in."
            }
        ))
        response.headers.set(
            "Set-Cookie",
            serialize(
                "session_id",
                id,
                cookieOptions
            )
        )

        // Return the response.
        return response
    }
}