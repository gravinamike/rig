<script lang="ts">
    import { onMobile } from "$lib/shared/utility";

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
            window.location.assign("/")
        } else {
            error = (await response.json()).message
        }
    }
</script>


<div
    class="sign-in"
    class:on-mobile={onMobile()}
>
    <h4>Sign in:</h4>

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
        <div>
            <label for="remember-user">Keep me logged in?</label>
            <input type="checkbox" id="remember-user" name="remember-user" bind:value={rememberUser} />
        </div>
        
        <!-- Submit button. -->
        <input type='submit' value="Submit" />
    </form>
</div>


<style>
    .sign-in {
        margin: 0.25rem;
    }

    .sign-in.on-mobile {
        font-size: 0.8rem;
    }

    .sign-in.on-mobile h4 {
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

    .sign-in.on-mobile form {
        gap: 0.5rem;
    }

    #username, #password {
        width: calc(100% - 0.5rem);
    }
</style>