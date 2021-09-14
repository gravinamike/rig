<script context="module" lang="ts">
    export type fetchType = (arg0: string) => Promise< any >
    export type paramSet = {[paramId: string]: string;}
    export type pageType = { host: string, path: string, params: paramSet, query: URLSearchParams }
    export type loadedProps = { props: { [propId: string]: Person | Person[] } }
    export type loadedError = { status: string, error: Error }
    export interface Person {
        name: string;
        avatar: string;
    }

    export async function load({ fetch }: { fetch: fetchType }): Promise< loadedProps | loadedError > {
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