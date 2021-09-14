<script context="module" lang="ts">
    import type { Person } from './api'

    export async function load({ fetch }: { fetch: any }) {
        const res = await fetch('/api');
  
        if (res.ok) return {
            props: { people: await res.json() }
        };
        return {
            status: res.status,
            error: new Error()
        };
    }
</script>
  
<script lang="ts">
    export let people: Person[];
</script>


<main>
    {#each people as { name, avatar }}
        <a href={`./${name}`} class="box">
            <img src={avatar} alt={name} />
            <h2>{name}</h2>
        </a>
    {/each}
</main>


<style>
    main {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
    }
    .box {
        padding: 1rem;
        margin: 1rem;
        box-shadow: 5px 5px 10px 2px lightgray;
    }
    .box:hover {
        box-shadow: 5px 5px 10px 10px lightgray;
    }
    img {
        width: 10rem;
    }
  </style>