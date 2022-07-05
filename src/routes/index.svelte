<script lang="ts">
    // Type imports.
    /*import type { WaitingIndicatorStates } from "$lib/shared/constants"

    // Import basic framework functions.
    import { onMount } from "svelte"

    // Import constants and configs.
    import { startingPThingIds, startingGraphDepth, navHeight } from "$lib/shared/constants"*/
    import { storeAppConfig } from "$lib/shared/config"

    // Import database/stores-related functions.
    /*import { loadingState, openGraphStore, updateRelationshipBeingCreatedEndpoint } from "$lib/stores"

    // Import widgets.
    import {
        ContextCommandPalette, Collapser, TabBlock, TabFlap, TabFlaps, TabBody, WaitingIndicator
    } from "$lib/widgets/layoutWidgets"
    import { RemoteRelatingWidget, ThingLinkingWidget, TextHyperlinkingWidget } from "$lib/widgets/dialogWidgets"

    // Import viewers.
    import FileViewer from "$lib/viewers/settingsViewers/fileViewer.svelte"
    import { DirectionsStoreViewer, SpacesStoreViewer, ThingsStoreViewer } from "$lib/viewers/storeViewers"
    import { DbLatestViewer } from "$lib/viewers/dbViewers"
    import { GraphViewer } from "$lib/viewers/graphViewers"
    import { RelationshipBeingCreatedWidget } from "$lib/widgets/graphWidgets"

    import { openUnigraph } from "$lib/shared/unigraph"*/
    

    /*openGraphStore.set(null)
    const graphIndicatorStates: WaitingIndicatorStates = {
        start: {
            text: "Configuration not loaded yet.",
            imageName: null
        },
        configLoading: {
            text: "Loading configuration...",
            imageName: "waiting"
        },
        configLoaded: {
            text: "No Graph loaded yet.",
            imageName: null
        },
        graphLoading: {
            text: "Loading Graph...",
            imageName: "waiting"
        },
        graphLoaded: {
            text: "Graph loaded!",
            imageName: null
        },
        error: {
            text: "Error loading Graph!",
            imageName: null
        }
    }




    // At app initialization,
    onMount(async () => {
        // Store configuration.
        $loadingState = "configLoading"
        const appConfig = await storeAppConfig()
        $loadingState = "configLoaded"

        if (appConfig.unigraphFolder) {
            $loadingState = "graphLoading"
            // Open the Unigraph currently specified in the store.
            await openUnigraph()
            openGraphStore.set(appConfig.unigraphFolder)
            $loadingState = "graphLoaded"
        }
	})

    function handleMouseMove(event: MouseEvent): void {/////////////////// MOVE INTO THE WIDGET
        updateRelationshipBeingCreatedEndpoint([event.clientX, event.clientY])
    }*/
</script>


<!--<svelte:head>
    <title>Rig{ $openGraphStore ? ` - ${$openGraphStore}` : "" }</title>
</svelte:head>


<main
    style="height: calc( 100% - {navHeight} )"
    on:mousemove={handleMouseMove}
>

    
    <ContextCommandPalette />

    
    <RelationshipBeingCreatedWidget />

    
    <RemoteRelatingWidget />

    
    <ThingLinkingWidget />
    <TextHyperlinkingWidget />

    
    <Collapser headerText={`File${ $openGraphStore ? `&nbsp;&nbsp;-&nbsp;&nbsp;${$openGraphStore}` : "" }`} contentDirection={"left"}>
        <FileViewer />
    </Collapser>
    
    
    <Collapser headerText={"System"} contentDirection={"left"}>
        <div class="tabs-container">

            <TabBlock>
                <TabFlaps>
                    <TabFlap>Stores</TabFlap>
                    <TabFlap>Database</TabFlap>
                </TabFlaps>
            
                
                <TabBody>
                    <TabBlock>
                        <TabFlaps>
                            <TabFlap>Directions</TabFlap>
                            <TabFlap>Spaces</TabFlap>
                            <TabFlap>Things</TabFlap>
                        </TabFlaps>
                    
                        
                        <TabBody>
                            <DirectionsStoreViewer />
                        </TabBody>
                    
                        
                        <TabBody>
                            <SpacesStoreViewer />
                        </TabBody>
                    
                        
                        <TabBody>
                            <ThingsStoreViewer />
                        </TabBody>
                    </TabBlock>
                </TabBody>
            
                
                <TabBody>
                    <DbLatestViewer />
                </TabBody>
            </TabBlock>
            
        </div>
    </Collapser>

    
    {#if $openGraphStore}
        <GraphViewer
            pThingIds={startingPThingIds}
            depth={startingGraphDepth}
        />
    {:else}
        <WaitingIndicator
            states={graphIndicatorStates}
            currentStateName={$loadingState}
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
</style>-->