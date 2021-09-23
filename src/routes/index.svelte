<script context="module" lang="ts">
    import type { Thing } from "./api/graph";
    import ThingsStoreView from "./thingsStoreView.svelte";
    import GraphPortal from "./graphPortal.svelte";

    const pThing = 251;

    export async function load({ fetch }: { fetch: any }) {
        const res = await fetch(`/api/thing-${pThing}`);
  
        if (res.ok) return {
            props: { things: await res.json() }
        };
        return {
            status: res.status,
            error: new Error()
        };
    }
</script>
  
<script lang="ts">
    export let things: Thing[];
</script>


<main>
    <ThingsStoreView
        {things}
    />
    <GraphPortal
        {things}
    />
</main>


<style>
    main {
        flex-grow: 1;
        display: flex;
        flex-direction: row;
        justify-content: space-evenly;
    }
</style>