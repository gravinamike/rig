<script lang="ts">
    // Import SvelteKit framework resources.
    import { get } from "svelte/store"

    // Import stores.
    import { loggerStore, userIdStore } from "$lib/stores"
    const logger = get(loggerStore)

    // Import utility functions.
    import { onMobile } from "$lib/shared/utility"



    // User ID to start with.
    const startingUserId = $userIdStore

    
    /**
     * Submit method.
     */
    async function handleSubmit() {
        // Post to the sign-out endpoint.
		await fetch("/api/auth/signOut")

        logger.info(
            {
                startingUserId
            },
            "User signed out."
        )

        // Refresh the site.
        window.location.assign("/")
	}
</script>


<!-- Sign-out menu. -->
<div
    class="sign-out"
    class:on-mobile={onMobile()}
>
    <!-- Current user name. -->
    <h4>User: {$userIdStore}</h4>

    <!-- Sign-out form. -->
    <form
        on:submit|preventDefault={ handleSubmit }
    >
        <!-- Submit button. -->
        <input type='submit' value="Sign out">
    </form>
</div>


<style>
    .sign-out {
        margin: 0.25rem;

        text-align: center;
    }

    .sign-out.on-mobile {
        font-size: 0.8rem;
    }
</style>