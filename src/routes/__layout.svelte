<script context="module" lang="ts">
    import { writable } from 'svelte/store';
    import type { Space, Thing } from "./api/graph";

    // Create the Spaces store.
    const s: { [id: number]: Space } = {};
    export const spacesStore = writable( s );
    // Create the Things store.
    const t: { [id: number]: Thing } = {};
    export const thingsStore = writable( t );
</script>


<script lang="ts">
    import Knex from 'knex';
    import { Model, knexSnakeCaseMappers } from 'objection';

    // Initialize Knex.
    const knex = Knex({
        client: 'pg',
        version: '1.4',
        connection: {
            user: 'sa',
            host: 'localhost',
            database: 'C:/Users/mtgra/Desktop/LifeSeahorse_test/LifeGrid_graph/graph',
            password: 'goodguess',
            port: 5435,
        },
        ...knexSnakeCaseMappers({ upperCase: true })
    });
    // Pass Knex instance to Objection.
    Model.knex(knex);
</script>


<svelte:head>
    <title>SvelteKit/TypeScript template</title>
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