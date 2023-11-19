<script lang="ts">
    // Import SvelteKit framework resources.
    import { onMount } from "svelte"

    // Import sores.
    import { landscapeOrientation } from "$lib/stores"

    
    // App width and height.
    let width: number
    let height: number

    // Track the orientation of the screen.
    $: if (mounted && width && height) {
        if ( screen.orientation.type.includes("landscape") ) {
            landscapeOrientation.set(true)
        } else {
            landscapeOrientation.set(false)
        }
    }


    // Track whether the component is mounted yet.
    let mounted = false
    onMount(async () => { mounted = true })
</script>


<!-- Bind app width and height for use in orientation flag. -->
<svelte:window
    bind:outerWidth={width}
    bind:outerHeight={height}
/>

<!-- Page content. -->
<slot />


<style>
    
</style>