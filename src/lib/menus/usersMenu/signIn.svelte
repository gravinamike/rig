<script lang="ts">
    import { onMobile } from "$lib/shared/utility"

    import { get } from "svelte/store"
    import { loggerStore } from "$lib/stores"
    const logger = get(loggerStore)


    let username = ""
    let password = ""
    let rememberUser = false


    // Error message.
    let error: string | null
  
    /**
     * Submit method.
     */
    async function handleSubmit() {
        // Post the user credentials to the sign-in endpoint.
        const response = await fetch("/api/auth/signIn", {
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
                "User signed in."
            )
            window.location.assign("/")
        } else {
            if (response.status === 401) {
                error = "Incorrect username or password."
                logger.error({
                    username: username,
                    msg: "Incorrect username or password."
                })
            } else {
                error = (await response.json()).message
                logger.error({
                    username: username,
                    msg: `Error when attempting user sign-in: ${error}`
                })
            }
        }
    }
</script>


<div
    class="sign-in"
    class:on-mobile={onMobile()}
>
    <!-- Error message. -->
    {#if error}
        <p class="error">{error}</p>
    {/if}

    <!-- Sign-in form. -->
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

        <!-- Remember-user field. -->
        <div class="remember-user-container">
            <label for="remember-user">Keep me logged in?</label>
            <input type="checkbox" id="remember-user" name="remember-user" bind:value={rememberUser} />
        </div>
        
        <!-- Submit button. -->
        <input id="submit" type='submit' value="Submit" />
    </form>
</div>


<style>
    .sign-in {
        margin: 1rem;
    }

    .sign-in.on-mobile {
        font-size: 0.8rem;
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
        align-items: center;
    }

    .sign-in.on-mobile form {
        gap: 0.5rem;
    }

    .remember-user-container {
        text-align: center;
    }

    #username, #password {
        width: calc(100% - 0.5rem);
    }

    form div:not(.remember-user-container) {
        width: 100%;

        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    input {
        outline: none;

        accent-color: grey;
    }

    #submit {
        width: 65px;
    }
</style>