<script context="module" lang="ts">
    import type { fetchType, pageType, loadedProps, loadedError } from './index.svelte'
    import type { Person } from './api'

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
    <div class="box">
        <img src="{person.avatar}" alt="{person.name}" />
    </div>
</main>


<style>
    main {
        margin: 4rem;
        padding: 2rem;
        color: gray;
        justify-content: center;
        box-shadow: 4px 5px 11px 10px lightgray;
    }
    h1 {
        color: salmon;
    }
    .box {
        display: flex;
        font-size: 1.5rem;
    }
    img {
        width: 15rem;
        object-fit: contain;
        margin-right: 2rem;
    }
</style>