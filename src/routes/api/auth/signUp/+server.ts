import type { RequestHandler } from "@sveltejs/kit"
import type { CookieSerializeOptions } from "cookie"
import { error } from "@sveltejs/kit"
import { serialize } from "cookie"
import { hashPassword, registerNewUser, getUserByUsername, createNewSession } from "$lib/server/auth"



/**
 * Post method for sign-up endpoint.
 *
 * @param body - The user-credentials object.
 * @returns - Server response object, including set-cookie header on success.
 */
export const POST: RequestHandler = async ({ request }) => {
    // Retrieve the user-credentials object by username.
    const body = await request.json()
    const user = await getUserByUsername(body.username)

    // If the user already exists, return an error.
    if (user) {
        throw error(409, `Couldn't create user "${body.username}" (user already exists).`)

    // Otherwise, register the user.
    } else {
        // Hash the password.
        const hashedPassword = await hashPassword(body.password)

        // If the password was successfully hashed,
        if (hashedPassword) {
            // Register the new user.
            await registerNewUser({username: body.username, hashedPassword: hashedPassword})

            // Create a new session with the username.
            const { id } = await createNewSession(body.username)

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

            // Create a response with a set-cookie header for the new session.
            const response = new Response(JSON.stringify(
                {
                    message: "Successfully signed up."
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

        // Otherwise, if the password was not successfully hashed, return the
        // error.
        } else {
            throw error(500, `Sign-up for user "${body.username}" failed (error hashing password).`)
        }
    }
}