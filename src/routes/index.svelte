<script lang="ts">
    import { onMount } from 'svelte'
    import { Graph } from "$lib/shared/graph/graph"
    import { storeSpaces, storeThings } from '$lib/shared/stores'
    import SpacesStoreView from "$lib/components/viewers/spacesStoreView.svelte"
    import ThingsStoreView from "$lib/components/viewers/thingsStoreView.svelte"
    import GraphPortal from "$lib/components/viewers/graphPortal.svelte"

    
    let graph = new Graph()
    const graphDepth = 1
    const pThingIds = [251]

    onMount(async () => {
        // Store Spaces.
        await storeSpaces()
        // Store Things and build Graph.
        await graph.buildGraph(pThingIds, graphDepth)
        graph = graph // Needed for reactivity.
	})
</script>


<main>
    <SpacesStoreView />
    <ThingsStoreView />
    <GraphPortal
        {graph}
    />
</main>


<style>
    main {
        height: calc( 100% - 3.2rem );
        display: flex;
        flex-direction: row;
    }
</style>