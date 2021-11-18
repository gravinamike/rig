<script lang="ts">
    import { navHeight } from "$lib/shared/constants"
</script>


<svelte:head>
    <title>Rig</title>
</svelte:head>


<main>
    <!-- Navbar -->
    <nav style="height: {navHeight};">
        <a href=".">GRAPH</a>
        <a href="/about">ABOUT</a>
    </nav>

    <!-- Page content -->
    <slot />
</main>


<style>
    main {
        flex-grow: 1;
        height: 100%;
        max-height: 100%;
        
        font-family: Arial;
    }
    
    nav {
        box-shadow: -2px 2px 10px 5px darkgray;

        box-sizing: border-box;

        display: flex;
        flex-direction: row;
        padding: 1rem;
        gap: 1rem;
    }

    a {
        text-decoration: none;
    }
</style>