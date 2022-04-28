<script lang="ts">
    // Import basic framework functions.
    import { onMount } from "svelte"

    // Import constants and configs.
    import { startingPThingIds, startingGraphDepth, navHeight } from "$lib/shared/constants"
    import { storeAppConfig } from "$lib/shared/config"

    // Import database/stores-related functions.
    import { graphOpenedStore, updateRelationshipBeingCreatedEndpoint } from "$lib/stores"

    // Import layout elements.
    import { ContextCommandPalette, Collapser, TabBlock, TabFlap, TabFlaps, TabBody } from "$lib/widgets/layoutWidgets"

    // Import viewers.
    import FileViewer from "$lib/viewers/settingsViewers/fileViewer.svelte"
    import { DirectionsStoreViewer, SpacesStoreViewer, ThingsStoreViewer } from "$lib/viewers/storeViewers"
    import { DbLatestViewer } from "$lib/viewers/dbViewers"
    import { GraphViewer } from "$lib/viewers/graphViewers"
    import { RelationshipBeingCreatedWidget } from "$lib/widgets/graphWidgets"

    import { openUnigraph } from "$lib/shared/unigraph"
    

    graphOpenedStore.set(false)



    


    // At app initialization,
    onMount(async () => {
        // Store configuration.
        await storeAppConfig()

        // Open the Unigraph currently specified in the store.
        await openUnigraph()
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
    
    <!-- Stores/database viewers. -->
    <Collapser headerText={"System"} contentDirection={"left"}>
        <div class="tabs-container">

            <TabBlock>
                <TabFlaps>
                    <TabFlap>File</TabFlap>
                    <TabFlap>Stores</TabFlap>
                    <TabFlap>Database</TabFlap>
                </TabFlaps>

                <!-- File viewer -->
                <TabBody>
                    <FileViewer />
                </TabBody>
            
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
    {#if $graphOpenedStore}
        <GraphViewer
            pThingIds={startingPThingIds}
            depth={startingGraphDepth}
        />
    {:else}
        <div style="margin: auto;">
            <span style="font-size: 1.5rem;">(No Graph loaded yet)</span>
        </div>
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