<script lang="ts">
    import { onMount } from "svelte"
    import Collapser from "$lib/components/layoutElements/collapser.svelte"
    import { TabBlock, TabFlap, TabFlaps, TabBody } from "$lib/components/layoutElements/tabs"

    import { startingPThingIds, startingGraphDepth, navHeight } from "$lib/shared/constants"
    import { storeConfig } from "$lib/shared/config"
    import { storeGraphConstructs } from "$lib/shared/stores/graphStores"

    import DirectionsStoreView from "$lib/components/viewers/storeViewers/directionsStoreView.svelte"
    import SpacesStoreView from "$lib/components/viewers/storeViewers/spacesStoreView.svelte"
    import ThingsStoreView from "$lib/components/viewers/storeViewers/thingsStoreView.svelte"
    import GraphPortal from "$lib/components/viewers/graphViewers/graphPortal.svelte"
    
    let graphConstructsStored = false

    onMount(async () => {
        // App constructs are stored when the app is initialized.
        storeConfig()

        // when the app is initialized, rather than when each Graph is initialized.
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
    }

    .tabs-container {
        width: 200px;
        height: 100%;
        
        overflow-x: hidden;
        overflow-y: hidden;
    }
</style>