<script lang="ts">
    import { onMount } from "svelte"
    import { storeDirections, storeSpaces } from '$lib/shared/stores'
    import Collapser from "$lib/components/layoutElements/collapser.svelte"
    import DirectionsStoreView from "$lib/components/viewers/directionsStoreView.svelte"
    import SpacesStoreView from "$lib/components/viewers/spacesStoreView.svelte"
    import ThingsStoreView from "$lib/components/viewers/thingsStoreView.svelte"
    import GraphPortal from "$lib/components/viewers/graphPortal.svelte"

    
    const pThingIds = [251]
    const graphDepth = 1

    onMount(async () => {
        await storeDirections()
        await storeSpaces()
	})
</script>


<main>
    <Collapser headerText={"Stored Directions"} contentDirection={"left"} expanded={false}>
        <DirectionsStoreView />
    </Collapser>
    <Collapser headerText={"Stored Spaces"} contentDirection={"left"} expanded={false}>
        <SpacesStoreView />
    </Collapser>
    <Collapser headerText={"Stored Things"} contentDirection={"left"} expanded={false}>
        <ThingsStoreView />
    </Collapser>
    <GraphPortal
        {pThingIds}
        depth={graphDepth}
    />
</main>


<style>
    main {
        height: calc( 100% - 3.2rem );
        display: flex;
        flex-direction: row;
    }
</style>