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