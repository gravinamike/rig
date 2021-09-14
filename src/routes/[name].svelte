<script context="module" lang="ts">
    export async function load({ fetch, page }: { fetch: any, page: any }) {
        const { name } = page.params;
        const res = await fetch(`/api/${name}`);
        
        if (res.ok) return {
            props: { person: await res.json() }
        };
        return {
            status: res.status,
            error: new Error(),
        };
    }
</script>
  
<script lang="ts">
    import type { Person } from './api'
    export let person: Person;
</script>


<main>
    <h1>{person.name}</h1>
    <img src="{person.avatar}" alt="{person.name}" />
</main>


<style>
    main {
        margin: 5rem;
        padding: 2rem;
        box-shadow: 5px 5px 10px 10px lightgray;
    }
    img {
        width: 10rem;
    }
</style>