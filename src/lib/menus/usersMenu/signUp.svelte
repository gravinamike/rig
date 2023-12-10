<script lang="ts">
    import { filenameIsValid, onMobile } from "$lib/shared/utility"

    import { get } from "svelte/store"
    import { loggerStore } from "$lib/stores"
    const logger = get(loggerStore)


    // Error message.
    let error: string | null

    // Initialize form values.
    let username = ""
    let password = ""
    let confirmPassword = ""
    let rememberUser = false

    /**
     * Submit method.
     */
    async function handleSubmit() {
        // Determine whether the username or password are invalid for any
        // reason.
        const usernameReserved = username === "all"
        const invalidUsernameCharacters = !filenameIsValid(username)
        const passwordsDontMatch = password !== confirmPassword
        const usernameTooLong = username.length > 255
        const passwordTooLong = password.length > 255

        // If the username or password are invalid, construct an error message.
        error = null
        if (usernameReserved || invalidUsernameCharacters || passwordsDontMatch || usernameTooLong || passwordTooLong) {
            const errorStrings: string[] = []
            if (usernameReserved) errorStrings.push(`Username "${username}" is reserved for use by the app.`)
            if (invalidUsernameCharacters) errorStrings.push("Username contains invalid characters.")
            if (passwordsDontMatch) errorStrings.push("Passwords do not match.")
            if (usernameTooLong) errorStrings.push("Username is too long.")
            if (passwordTooLong) errorStrings.push("Passwords is to long.")
            error = errorStrings.join(" ")

        // Otherwise,
        } else {
            // Post the user credentials to the sign-in endpoint.
            const response = await fetch("/api/auth/signUp", {
                method: 'POST',
                body: JSON.stringify({username, password, rememberUser}),
                headers: {
                    "Content-Type": "application/json"
                }
            })
        
            // Either refresh the site, or display the error.
            if (response.ok) {
                logger.info(
                    {
                        username
                    },
                    "User signed up."
                )
                window.location.assign("/")
            } else {
                error = (await response.json()).message
                logger.error({
                    username: username,
                    msg: `Error when attempting user sign-up: ${error}`
                })
            }
        }
    }
</script>


<div
    class="sign-up"
    class:on-mobile={onMobile()}
>
    <h4>Create new user:</h4>

    <!-- Error message. -->
    {#if error}
        <p class="error">{error}</p>
    {/if}

    <!-- Sign-up form. -->
    <form
        on:submit|preventDefault={ handleSubmit }
    >
        <!-- Username field. -->
        <div>
            <label for="username">Username:</label>
            <input type="text" id="username" name="username" bind:value={username} required />
        </div>

        <!-- Password field. -->
        <div>
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" bind:value={password} required />
        </div>

        <!-- Confirm-password field. -->
        <div>
            <label for="confirm-password">Confirm password:</label>
            <input type="password" id="confirm-password" name="confirm-password" bind:value={confirmPassword} required />
        </div>

        <!-- Remember-user field. -->
        <div>
            <label for="remember-user">Keep me logged in?</label>
            <input type="checkbox" id="remember-user" name="remember-user" bind:value={rememberUser} />
        </div>

        <!-- Error message. -->
        {#if error}
            <p class="error">{error}</p>
        {/if}

        <!-- Submit button. -->
        <input type='submit' value="Submit" />
    </form>
</div>


<style>
    .sign-up {
        margin: 0.25rem;
    }

    .sign-up.on-mobile {
        font-size: 0.8rem;
    }

    .sign-up.on-mobile h4 {
        margin-top: 0.75rem;
        margin-bottom: 0.75rem;
    }
    
    .error {
        font-weight: 600;
        color: red;
    }

    form {
        position: relative;

        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .sign-up.on-mobile form {
        gap: 0.5rem;
    }

    #username, #password, #confirm-password {
        width: calc(100% - 0.5rem);
    }
</style>