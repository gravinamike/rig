<script lang="ts">
    import { landscapeOrientation } from "$lib/stores"

    
    // App width and height.
    let width: number
    let height: number

    // Track whether the screen is in landscape or portrait orientation.
    $: if (width && height) {
        if (width > height) {
            landscapeOrientation.set(true)
        } else {
            landscapeOrientation.set(false)
        }
    }
</script>


<!-- Bind app width and height for use in orientation flag. -->
<svelte:window
    bind:innerWidth={width}
    bind:innerHeight={height}
/>

<!-- Page content. -->
<slot />


<style>
    
</style>