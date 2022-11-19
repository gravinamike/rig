<script lang="ts">
    // Type imports.
    import type { WaitingIndicatorStates } from "$lib/shared/constants"

    // Import basic framework functions.
    import { onMount } from "svelte"

    // Import constants and configs.
    import { startingGraphDepth, navHeight } from "$lib/shared/constants"
    import { storeAppConfig } from "$lib/shared/config"

    // Import database/stores-related functions.
    import { loadingState, openGraphStore, perspectiveThingIdStore, reorderingInfoStore, updateMousePosition, updateRelationshipBeingCreatedEndpoint } from "$lib/stores"

    // Import widgets.
    import {
        ContextCommandPalette, Collapser, TabBlock, TabFlap, TabFlaps, TabBody, WaitingIndicator
    } from "$lib/widgets/layoutWidgets"
    import { 
        NewFileWidget, RemoteRelatingWidget, ThingLinkingWidget, TextHyperlinkingWidget,
        RelationshipReorderController
    } from "$lib/widgets/dialogWidgets"

    // Import viewers.
    import FileViewer from "$lib/viewers/settingsViewers/fileViewer.svelte"
    import { DirectionsStoreViewer, SpacesStoreViewer, ThingsStoreViewer } from "$lib/viewers/storeViewers"
    import { DbLatestViewer } from "$lib/viewers/dbViewers"
    import { GraphViewer } from "$lib/viewers/graphViewers"
    import { RelationshipBeingCreatedWidget } from "$lib/widgets/graphWidgets"

    import { openUnigraph } from "$lib/shared/unigraph"

    import { LogoIcon } from "$lib/widgets/layoutWidgets"
    

    openGraphStore.set(null)
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

    function handleMouseMove(event: MouseEvent): void {
        updateMousePosition([event.clientX, event.clientY])
        updateRelationshipBeingCreatedEndpoint([event.clientX, event.clientY])
    }
</script>


<svelte:head>
    <title>Rig{ $openGraphStore ? ` - ${$openGraphStore}` : "" }</title>
</svelte:head>


<main
    class:reorderRow={
        $reorderingInfoStore.dragStartPosition !== null
        && $reorderingInfoStore.thingCohort?.rowOrColumn() === "row"
    }
    class:reorderColumn={
        $reorderingInfoStore.dragStartPosition !== null
        && $reorderingInfoStore.thingCohort?.rowOrColumn() === "column"
    }
    style="height: calc( 100% - {navHeight} )"

    on:mousemove={handleMouseMove}
>
    <div style="position: absolute; z-index: 5;"><LogoIcon /></div>
    <!-- Front pane for context menus and command palettes. -->
    <ContextCommandPalette />

    <!-- Front pane for new file dialog. -->
    <NewFileWidget />

    <!-- Front pane for Relationship-being-created Widget. -->
    <RelationshipBeingCreatedWidget />

    <!-- Front pane for Relationship-being-created Widget. -->
    <RemoteRelatingWidget />

    <!-- Front panes for Thing-linking and text-hyperlinking Widgets. -->
    <ThingLinkingWidget />
    <TextHyperlinkingWidget />

    <!-- Controller for Relationship-reorder operations. -->
    <RelationshipReorderController />

    <!-- File viewer. -->
    <Collapser headerText={`File${ $openGraphStore ? `&nbsp;&nbsp;-&nbsp;&nbsp;${$openGraphStore}` : "" }`} contentDirection={"left"}>
        <FileViewer />
    </Collapser>
    
    <!-- Stores/database viewers. -->
    <Collapser headerText={"System"} contentDirection={"left"}>
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
    {#if $openGraphStore}
        <GraphViewer
            pThingIds={[$perspectiveThingIdStore]}
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

    :global(main.reorderRow *) {
        cursor: col-resize;
    }

    :global(main.reorderColumn *) {
        cursor: row-resize;
    }

    .tabs-container {
        width: 200px;
        height: 100%;
        
        overflow-x: hidden;
        overflow-y: hidden;
    }
</style>