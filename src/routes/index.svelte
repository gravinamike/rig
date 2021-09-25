<script context="module" lang="ts">
    import type { Space, Thing } from "./api/graph";
    import SpacesStoreView from "./spacesStoreView.svelte";
    import ThingsStoreView from "./thingsStoreView.svelte";
    import GraphPortal from "./graphPortal.svelte";

    const pThing = 251;

    export async function load({ fetch }: { fetch: any }) {
        const props = { spaces: null, things: null };
        var res = await fetch(`/api/spaces-all`);
        if (res.ok) {
            props.spaces = await res.json()
        } else {
            return { status: res.status, error: new Error() }
        }
        var res = await fetch(`/api/thing-${pThing}`);
        if (res.ok) {
            props.things = await res.json()
        } else {
            return { status: res.status, error: new Error() }
        }
        return { props: props }
    }
</script>
  
<script lang="ts">
    export let spaces: Space[];
    export let things: Thing[];
</script>


<main>
    <SpacesStoreView
        {spaces}
    />
    <ThingsStoreView
        {things}
    />
    <GraphPortal
        {things}
    />
</main>


<style>
    main {
        height: calc( 100% - 3.1rem );
        display: flex;
        flex-direction: row;
        justify-content: space-evenly;
    }
</style>