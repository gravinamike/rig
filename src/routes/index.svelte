<script lang="ts">
    import { onMount } from "svelte"
    import { startingPThingIds, startingGraphDepth, navHeight } from "$lib/shared/constants"
    import { storeGraphConstructs } from '$lib/shared/stores/graphStores'
    import Collapser from "$lib/components/layoutElements/collapser.svelte"
    import DirectionsStoreView from "$lib/components/viewers/directionsStoreView.svelte"
    import SpacesStoreView from "$lib/components/viewers/spacesStoreView.svelte"
    import ThingsStoreView from "$lib/components/viewers/thingsStoreView.svelte"
    import GraphPortal from "$lib/components/viewers/graphPortal.svelte"


    onMount(async () => {
        // Graph constructs which are small in number (Directions, Spaces) are stored
        // when the app is initialized, rather than when each Graph is initialized.
        await storeGraphConstructs("Direction")
        await storeGraphConstructs("Space")
	})
</script>


<main style="height: calc( 100% - {navHeight} )">
    <!-- Directions Store view --> 
    <Collapser headerText={"Stored Directions"} contentDirection={"left"}>
        <DirectionsStoreView />
    </Collapser>
    
    <!-- Spaces Store view --> 
    <Collapser headerText={"Stored Spaces"} contentDirection={"left"}>
        <SpacesStoreView />
    </Collapser>

    <!-- Things Store view --> 
    <Collapser headerText={"Stored Things"} contentDirection={"left"}>
        <ThingsStoreView />
    </Collapser>

    <!-- Graph Portal. --> 
    <GraphPortal
        pThingIds={startingPThingIds}
        depth={startingGraphDepth}
    />
</main>


<style>
    main {
        display: flex;
        flex-direction: row;
    }
</style>