<svelte:head>
    <title>SvelteKit/TypeScript template</title>
</svelte:head>

<nav>
    <a href=".">HOME</a>
    <a href="/about">ABOUT</a>
</nav>


<slot />


<style>
    nav {
        padding: 1rem;
        box-shadow: -2px 2px 10px 5px darkgray;
    }
    a {
        text-decoration: none;
        margin-right: 1rem;
    }
</style>