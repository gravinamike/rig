<script lang="ts">
    import { onMobile } from "$lib/shared/utility"
    import { loggerStore, userIdStore } from "$lib/stores"

    import { get } from "svelte/store"
    const logger = get(loggerStore)



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


<div
    class="sign-out"
    class:on-mobile={onMobile()}
>
    <h4>User: {$userIdStore}</h4>

    <!-- Sign-up form. -->
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