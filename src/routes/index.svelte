<script lang="ts">
    // Import basic framework functions.
    import { onMount } from "svelte"

    // Import constants and configs.
    import { startingPThingIds, startingGraphDepth, navHeight } from "$lib/shared/constants"
    import { storeConfig } from "$lib/shared/config"

    // Import database/stores-related functions.
    import { storeGraphConstructs, updateRelationshipBeingCreatedEndpoint } from "$lib/stores"

    // Import layout elements.
    import { ContextCommandPalette, Collapser, TabBlock, TabFlap, TabFlaps, TabBody } from "$lib/widgets/layoutWidgets"

    // Import viewers.
    import { DirectionsStoreViewer, SpacesStoreViewer, ThingsStoreViewer } from "$lib/viewers/storeViewers"
    import { DbLatestViewer } from "$lib/viewers/dbViewers"
    import { GraphViewer } from "$lib/viewers/graphViewers"
    import { RelationshipBeingCreatedWidget } from "$lib/widgets/graphWidgets"
    

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

    function handleMouseMove(event: MouseEvent): void {/////////////////// MOVE INTO THE WIDGET
        updateRelationshipBeingCreatedEndpoint([event.clientX, event.clientY])
    }
</script>


<main
    style="height: calc( 100% - {navHeight} )"
    on:mousemove={handleMouseMove}
>

    <!-- Front pane for context menus and command palettes. -->
    <ContextCommandPalette />

    <!-- Front pane for Relationship-being-created Widget. -->
    <RelationshipBeingCreatedWidget />
    
    <!-- Stores viewers. -->
    <Collapser headerText={"Stores / Database"} contentDirection={"left"}>
        <div class="tabs-container">

            <TabBlock>
                <TabFlaps>
                    <TabFlap>Stores</TabFlap>
                    <TabFlap>Database</TabFlap>
                </TabFlaps>
            
                <!-- Stores tab --> 
                <TabBody>
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
                </TabBody>
            
                <!-- Database tab --> 
                <TabBody>
                    <DbLatestViewer />
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