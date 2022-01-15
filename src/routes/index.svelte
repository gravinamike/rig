<script lang="ts">
    import { onMount } from "svelte"
    import { Collapser, TabBlock, TabFlap, TabFlaps, TabBody } from "$lib/widgets/layoutWidgets"

    import { startingPThingIds, startingGraphDepth, navHeight } from "$lib/shared/constants"
    import { storeConfig } from "$lib/shared/config"
    import { storeGraphConstructs } from "$lib/stores"

    import { DirectionsStoreViewer, SpacesStoreViewer, ThingsStoreViewer } from "$lib/viewers/storeViewers"
    import { GraphViewer } from "$lib/viewers/graphViewers"
    
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
                    <DirectionsStoreViewer />
                </TabBody>
            
                <!-- Spaces Store view --> 
                <TabBody>
                    <SpacesStoreViewer />
                </TabBody>
            
                <!-- Things Store view --> 
                <TabBody>
                    <ThingsStoreViewer />
                </TabBody>
            </TabBlock>
            
        </div>
    </Collapser>

    <!-- Graph Portal. -->
    {#if graphConstructsStored}
        <GraphViewer
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