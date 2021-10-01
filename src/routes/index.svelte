<script context="module" lang="ts">
    const pThing = 251;

    export async function load({ fetch }: { fetch: any }) {
        const props = { spaces: null, things: null };

        // Get Spaces.
        var res = await fetch(`/api/spaces-all`);
        if (res.ok) {
            props.spaces = await res.json()
        } else {
            return { status: res.status, error: new Error() }
        }

        // Get Perspective Thing.
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
    import type { Space, Thing } from "./api/graph";
    import SpacesStoreView from "./viewers/spacesStoreView.svelte";
    import ThingsStoreView from "./viewers/thingsStoreView.svelte";
    import GraphPortal from "./viewers/graphViewers/graphPortal.svelte";
    
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
        height: calc( 100% - 3.2rem );
        display: flex;
        flex-direction: row;
    }
</style>