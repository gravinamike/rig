<script lang="ts">
    import { userIdStore } from "$lib/stores"

    
    /**
     * Submit method.
     */
    async function handleSubmit() {
        // Post to the sign-out endpoint.
		await fetch("/api/auth/signOut")

        // Refresh the site.
        window.location.assign("/")
	}
</script>


<div class="sign-out">
    <h4>You are signed in as: {$userIdStore}</h4>

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
</style>