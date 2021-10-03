<script context="module" lang="ts">
    import { writable } from 'svelte/store';
    import type { Space, Thing } from "$lib/graph";

    // Create the Spaces store.
    const s: { [id: number]: Space } = {};
    export const spacesStore = writable( s );
    // Create the Things store.
    const t: { [id: number]: Thing } = {};
    export const thingsStore = writable( t );
    console.log('foo');
</script>


<script lang="ts">

</script>


<svelte:head>
    <title>Rig</title>
</svelte:head>

<main>
    <nav>
        <a href=".">GRAPH</a>
        <a href="/about">ABOUT</a>
    </nav>
    <slot />
</main>


<style>
    main {
        flex-grow: 1;
        height: 100%;
        max-height: 100%;
    }
    nav {
        padding: 1rem;
        box-shadow: -2px 2px 10px 5px darkgray;
    }
    a {
        margin-right: 1rem;
        text-decoration: none;
    }
</style>