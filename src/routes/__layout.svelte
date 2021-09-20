<script lang="ts">
    import  Knex from 'knex'
    import { Model, knexSnakeCaseMappers } from 'objection'

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


<nav>
    <a href=".">GRAPH</a>
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