<script lang="ts">
    import { onMount } from "svelte"
    import Collapser from "$lib/widgets/layoutWidgets/collapser.svelte"
    import { TabBlock, TabFlap, TabFlaps, TabBody } from "$lib/widgets/layoutWidgets/tabs"

    import { startingPThingIds, startingGraphDepth, navHeight } from "$lib/shared/constants"
    import { storeConfig } from "$lib/shared/config"
    import { storeGraphConstructs } from "$lib/stores/graphStores"

    import DirectionsStoreView from "$lib/viewers/storeViewers/directionsStoreView.svelte"
    import SpacesStoreView from "$lib/viewers/storeViewers/spacesStoreView.svelte"
    import ThingsStoreView from "$lib/viewers/storeViewers/thingsStoreView.svelte"
    import GraphPortal from "$lib/viewers/graphViewers/graphViewer.svelte"
    
    let graphConstructsStored = false

    // At app initialization,
    onMount(async () => {
        // Store app configuration.
        storeConfig()

        // Store Direction and Space constructs.
        await storeGraphConstructs("Direction")
        await storeGraphConstructs("Space")
        graphConstructsStored = true
	})
</script>


<main style="height: calc( 100% - {navHeight} )">

    <Collapser headerText={"Stores"} contentDirection={"left"}>
        <div class="tabs-container">

            <TabBlock>
                <TabFlaps>
                    <TabFlap>Directions</TabFlap>
                    <TabFlap>Spaces</TabFlap>
                    <TabFlap>Things</TabFlap>
                </TabFlaps>
            
                <!-- Directions Store view --> 
                <TabBody>
                    <DirectionsStoreView />
                </TabBody>
            
                <!-- Spaces Store view --> 
                <TabBody>
                    <SpacesStoreView />
                </TabBody>
            
                <!-- Things Store view --> 
                <TabBody>
                    <ThingsStoreView />
                </TabBody>
            </TabBlock>
            
        </div>
    </Collapser>

    <!-- Graph Portal. -->
    {#if graphConstructsStored}
        <GraphPortal
            pThingIds={startingPThingIds}
            depth={startingGraphDepth}
        />
    {/if}

</main>


<style>
    main {
        display: flex;
        flex-direction: row;

        overflow: hidden;
    }

    .tabs-container {
        width: 200px;
        height: 100%;
        
        overflow-x: hidden;
        overflow-y: hidden;
    }
</style>