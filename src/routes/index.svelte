<script lang="ts">
    // Type imports.
    import type { WaitingIndicatorStates } from "$lib/shared/constants"

    // Import basic framework functions.
    import { onMount } from "svelte"

    // Import constants and configs.
    import { startingGraphDepth } from "$lib/shared/constants"
    import { storeAppConfig } from "$lib/shared/config"

    // Import database/stores-related functions.
    import { loadingState, openGraphStore, perspectiveThingIdStore, reorderingInfoStore, updateMousePosition, updateRelationshipBeingCreatedEndpoint } from "$lib/stores"

    // Import widgets.
    import {
        ContextCommandPalette, SideMenu, TabBlock, TabFlap, TabFlaps, TabBody, WaitingIndicator
    } from "$lib/widgets/layoutWidgets"
    import { 
        NewFileWidget, RemoteRelatingWidget, ThingLinkingWidget, TextHyperlinkingWidget,
        RelationshipReorderController
    } from "$lib/widgets/dialogWidgets"

    // Import viewers.
    import FileViewer from "$lib/viewers/settingsViewers/fileViewer.svelte"
    import AboutMenu from "$lib/viewers/about.svelte"
    import { DirectionsStoreViewer, SpacesStoreViewer, ThingsStoreViewer } from "$lib/viewers/storeViewers"
    import { DbLatestViewer } from "$lib/viewers/dbViewers"
    import { GraphViewer } from "$lib/viewers/graphViewers"
    import { defaultGraphWidgetStyle, RelationshipBeingCreatedWidget, type GraphWidgetStyle } from "$lib/widgets/graphWidgets"

    import { openUnigraph } from "$lib/shared/unigraph"





    // Import viewers.
    import { GraphSettingsViewer } from "$lib/viewers/settingsViewers"
    import { GraphSchematicViewer } from "$lib/viewers/graphViewers"
    import { ThingSearchboxViewer, HistoryViewer, PinsViewer, DirectionsViewer, SpacesViewer } from "$lib/viewers/navViewers"
    import type { Graph, Space } from "$lib/models/constructModels";




    

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












    let sideMenuInfos = [
        {
            name: "Thing",
            icon: "thing"
        },
        {
            name: "Space",
            icon: "space"
        },
        {
            name: "Settings",
            icon: "settings"
        },
        {
            name: "File",
            icon: "file"
        },
        {
            name: "Dev",
            icon: "dev"
        },
        {
            name: "About",
            icon: "about"
        },
    ]
    let openedSideMenuName: string | null = "Thing"

    // Attributes handled by the Graph Viewer.
    let graph: Graph | null
    let graphWidgetStyle: GraphWidgetStyle = {...defaultGraphWidgetStyle}
    let allowZoomAndScrollToFit: boolean
    let rePerspectToThingId: (thingId: number, updateHistory?: boolean, zoomAndScroll?: boolean) => Promise<void>
    let back: () => void
    let forward: () => void
    let setGraphSpace: (space: Space) => void
</script>


<svelte:head>
    <title>{ $openGraphStore ? $openGraphStore : "Rig" }</title>
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

    on:mousemove={handleMouseMove}
>
    
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







    <SideMenu
        {sideMenuInfos}
        bind:openedSideMenuName
        openWidth={400}
        openTime={250}
        overlapPage={false}
    >
        {#if openedSideMenuName === "File"}
            <FileViewer />
        {:else if openedSideMenuName === "Settings"}
            {#if graph}
                <GraphSettingsViewer
                    bind:graph
                    bind:graphWidgetStyle
                    bind:allowZoomAndScrollToFit
                />
            {/if}
        {:else if openedSideMenuName === "Dev"}
            <div class="tabs-container">

                <TabBlock>
                    <TabFlaps>
                        <TabFlap>Schematic</TabFlap>
                        <TabFlap>Stores</TabFlap>
                        <TabFlap>Database</TabFlap>
                    </TabFlaps>

                    <!-- Graph Schematic tab. -->
                    <TabBody>
                        {#if graph}
                            <GraphSchematicViewer
                                {graph}
                            />
                        {/if}
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
        {:else if openedSideMenuName === "About"}
            <AboutMenu />
        {:else if openedSideMenuName === "Thing"}
            <div class="navigation-view">
                <!-- Thing searchbox -->
                <div class="search-back-and-forth-buttons-container">
                    <div class="search-container">
                        <ThingSearchboxViewer
                            {rePerspectToThingId}
                        />
                    </div>

                    <!-- Back and forth buttons. -->
                    <div class="back-and-forth-buttons">
                        <button
                            on:click={back}
                        >
                            ◄
                        </button>
                        <button
                            on:click={forward}
                        >
                            ►
                        </button>
                    </div>
                </div>

                <div class="history-pins-container">        
                    <!-- Graph pins viewer -->
                    <div class="pins-container">
                        <PinsViewer
                            {rePerspectToThingId}
                        />
                    </div>

                    <!-- Graph history viewer -->
                    {#if graph}
                        <div class="history-container">
                            <HistoryViewer
                                bind:graph
                                {rePerspectToThingId}
                            />
                        </div>
                    {/if}
                </div>
            </div>
        {:else if openedSideMenuName === "Space"}
            <div class="directions-spaces-container">
                {#if graph}
                    <!-- Directions viewer -->
                    <div class="directions-container">
                        <DirectionsViewer
                        />
                    </div>

                    <!-- Spaces viewer -->
                    <div class="spaces-container">
                        <SpacesViewer
                            {graph}
                            {graphWidgetStyle}
                            {setGraphSpace}
                        />
                    </div>
                {/if}
            </div>
        {/if}
    </SideMenu>





















    
    
    


    <!-- Graph Portal. -->
    {#if $openGraphStore}
        <GraphViewer
            pThingIds={[$perspectiveThingIdStore]}
            depth={startingGraphDepth}
            bind:graph
            bind:graphWidgetStyle
            bind:allowZoomAndScrollToFit
            bind:rePerspectToThingId
            bind:back
            bind:forward
            bind:setGraphSpace
        />
    {:else}
        <WaitingIndicator
            states={graphIndicatorStates}
            currentStateName={$loadingState}
        />
    {/if}

</main>


<style>
    .navigation-view {
        height: 100%;

        display: flex;
        flex-direction: column;

        overflow-x: hidden;
        overflow-y: hidden;
    }

    .search-back-and-forth-buttons-container {
        outline: solid 1px lightgrey;
        outline-offset: -1px;

        background-color: #fafafa;

        display: flex;
    }

    .search-container {
        flex: 1 1 0;
    }

    .back-and-forth-buttons {
        display: flex;
        flex-direction: row;
        padding: 5px;
        gap: 5px;
    }

    button {
        font-size: 1.25rem;
    }

    .history-pins-container {
        flex: 1 1 auto;

        position: relative;

        display: flex;
        flex-direction: row;

        overflow:hidden;
    }

    .pins-container {
        width: 45%;

        overflow: hidden;
    }

    .history-container {
        width: 55%;

        overflow: hidden;
    }

    .directions-spaces-container {
        position: relative;
        height: 100%;

        display: flex;
        flex-direction: row;
    }

    .directions-container {
        width: 50%;
    }

    .spaces-container {
        width: 55%;

        scrollbar-width: thin;
    }


















    main {
        height: 100%;

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
        width: 100%;
        height: 100%;
        background-color: white;;
        
        overflow-x: hidden;
        overflow-y: hidden;
    }
</style>