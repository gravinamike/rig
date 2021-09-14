<script context="module" lang="ts">
    import type { fetchType, pageType, loadedProps, loadedError, Person } from './index.svelte'

    export async function load({ fetch, page }: { fetch: fetchType, page: pageType }): Promise< loadedProps | loadedError > {
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