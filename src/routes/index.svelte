<script lang="ts">
    // Type imports.
    import type { WaitingIndicatorStates } from "$lib/shared/constants"
    import type { Graph, Space } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"

    // Import basic framework functions.
    import { onMount } from "svelte"

    // Import constants and configs.
    import { startingGraphDepth } from "$lib/shared/constants"
    import { storeAppConfig } from "$lib/shared/config"

    // Import database/stores-related functions.
    import { devMode, fontNames, loadingState, openGraphStore, perspectiveThingIdStore, reorderingInfoStore, updateMousePosition, updateRelationshipBeingCreatedEndpoint } from "$lib/stores"

    // Import widgets.
    import {
        ContextCommandPalette, SideMenu, TabBlock, TabFlap, TabFlaps, TabBody, WaitingIndicator
    } from "$lib/widgets/layoutWidgets"
    import { 
        NewFileWidget, RemoteRelatingWidget, ThingLinkingWidget, TextHyperlinkingWidget,
        RelationshipReorderController
    } from "$lib/widgets/dialogWidgets"

    // Import viewers.
    import { ThingSearchboxViewer, HistoryViewer, PinsViewer, DirectionsViewer, SpacesViewer } from "$lib/viewers/navViewers"
    import { GraphSettingsViewer } from "$lib/viewers/settingsViewers"
    import FileViewer from "$lib/viewers/settingsViewers/fileViewer.svelte"
    import { GraphSchematicViewer } from "$lib/viewers/graphViewers"
    import { DirectionsStoreViewer, SpacesStoreViewer, ThingsStoreViewer } from "$lib/viewers/storeViewers"
    import { DbLatestViewer } from "$lib/viewers/dbViewers"    
    import AboutMenu from "$lib/viewers/about.svelte"
    import { GraphViewer } from "$lib/viewers/graphViewers"

    // Import related widgets.
    import { defaultGraphWidgetStyle, RelationshipBeingCreatedWidget } from "$lib/widgets/graphWidgets"

    // Import API methods.
    import { openUnigraph } from "$lib/shared/unigraph"
    import { getFontNames } from "$lib/db/clientSide/getInfo"
    import { onMobile } from "$lib/shared/utility";


    // Initialize states for waiting indicator.
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

    // Initialize side-menu configuration.
    $: subMenuInfos = [
        [
            {
                name: "About",
                icon: "about"
            },
            {
                name: "File",
                icon: "file"
            }
        ].filter(info => info !== null) as { name: string, icon: string }[],

        [
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
            $devMode ?
                {
                    name: "Dev",
                    icon: "dev"
                } :
                null
        ].filter(info => info !== null) as { name: string, icon: string }[]
    ]
    let openedSubMenuName: string | null
    const defaultOpenSubMenuName = "Thing"


    // Initialize open-Graph store and which side menu to open.
    openGraphStore.set(null)

    // Attributes handled by the Graph Viewer.
    let graph: Graph | null
    let graphWidgetStyle: GraphWidgetStyle = {...defaultGraphWidgetStyle}
    let allowZoomAndScrollToFit: boolean
    let rePerspectToThingId: (thingId: number, updateHistory?: boolean, zoomAndScroll?: boolean) => Promise<void>
    let back: () => void
    let forward: () => void
    let setGraphSpace: (space: Space) => void

    
    /**
     * Handle-mouse-move method.
     * 
     * Updates the mouse-position tracker and the endpoint for any in-progress
     * Relationship-creation operation.
     */
    function handleMouseMove( event: MouseEvent ): void {
        updateMousePosition( [event.clientX, event.clientY] )
        updateRelationshipBeingCreatedEndpoint( [event.clientX, event.clientY] )
    } 


    // At app initialization,
    onMount(async () => {
        $loadingState = "configLoading"

        // Set the stores.
        devMode.set(import.meta.env.MODE === "development")
        const apiFontNames = await getFontNames()
        if (apiFontNames) fontNames.set(apiFontNames)
        const appConfig = await storeAppConfig()

        $loadingState = "configLoaded"

        // Open the Unigraph currently specified in the store.
        if (appConfig.unigraphFolder) {
            $loadingState = "graphLoading"

            await openUnigraph()
            openGraphStore.set(appConfig.unigraphFolder)

            $loadingState = "graphLoaded"
        }
	})



    let leftMenuOpen: boolean
    let rightMenuOpen: boolean
    let closeLeftMenu: () => {}
    let closeRightMenu: () => {}

    $: if (onMobile() && window.innerWidth < 600 && leftMenuOpen) closeRightMenu()
    $: if (onMobile() && window.innerWidth < 600 && rightMenuOpen) closeLeftMenu()




    let height: number
    $: console.log(height)
    $: useTabbedLayout = height < 500




</script>


<!-- Set page title based on open Graph. -->
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

    bind:clientHeight={height}
    
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


    <!-- Side-menu. -->
    <SideMenu
        {subMenuInfos}
        {defaultOpenSubMenuName}
        bind:openedSubMenuName
        bind:open={leftMenuOpen}
        overlapPage={false}
        bind:close={closeLeftMenu}
    >
        <!-- Thing menu. -->
        {#if openedSubMenuName === "Thing"}
            <div class="navigation-view">
                <!-- Thing searchbox. -->
                <div class="search-container">
                    <ThingSearchboxViewer
                        {rePerspectToThingId}
                    />
                </div>

                <div class="pins-history-container">

                    {#if useTabbedLayout}

                        <TabBlock>
                            <TabFlaps>
                                <TabFlap><span style="font-size: 1.25rem;">History</span></TabFlap>
                                <TabFlap><span style="font-size: 1.25rem;">Pins</span></TabFlap>
                            </TabFlaps>
        
                            <!-- Graph Schematic tab. -->
                            <TabBody>
                                {#if graph}
                                    <HistoryViewer
                                        bind:graph
                                        {useTabbedLayout}
                                        {rePerspectToThingId}
                                    />
                                {/if}
                            </TabBody>
                        
                            <!-- Stores tab. --> 
                            <TabBody>
                                <PinsViewer
                                    {useTabbedLayout}
                                    {rePerspectToThingId}
                                />
                            </TabBody>
                        </TabBlock>

                    {:else}

                        <!-- Graph history viewer -->
                        {#if graph}
                            <div
                                class="history-container"

                                style={
                                    onMobile() && window.innerHeight < 500 ? "height: 50%" :
                                    ""
                                }
                            >
                                <HistoryViewer
                                    bind:graph
                                    {useTabbedLayout}
                                    {rePerspectToThingId}
                                />
                            </div>
                        {/if}
                        
                        <!-- Graph pins viewer -->
                        <div
                            class="pins-container"

                            style={
                                onMobile() && window.innerHeight < 500 ? "height: 50%" :
                                ""
                            }
                        >
                            <PinsViewer
                                {useTabbedLayout}
                                {rePerspectToThingId}
                            />
                        </div>

                    {/if}

                    <!-- Navigate back and forth buttons. -->
                    <div
                        class="back-and-forth-buttons"
                        class:on-mobile={onMobile()}
                    >
                        <button
                            on:click={back}
                            on:keydown={()=>{}}
                        >
                            ◄
                        </button>
                        <button                        
                            on:click={forward}
                            on:keydown={()=>{}}
                        >
                            ►
                        </button>
                    </div>
                    
                </div>
            </div>

        <!-- Space menu. -->
        {:else if openedSubMenuName === "Space"}
            <div class="directions-spaces-container">

                {#if useTabbedLayout}

                    <TabBlock>
                        <TabFlaps>
                            <TabFlap><span style="font-size: 1.25rem;">Directions</span></TabFlap>
                            <TabFlap><span style="font-size: 1.25rem;">Spaces</span></TabFlap>
                        </TabFlaps>
    
                        {#if graph}
                            <TabBody>
                                <DirectionsViewer
                                    {graph}
                                    {graphWidgetStyle}
                                    {useTabbedLayout}
                                />
                            </TabBody>
                        
                            <TabBody>
                                <SpacesViewer
                                    {graph}
                                    {graphWidgetStyle}
                                    {useTabbedLayout}
                                    {setGraphSpace}
                                />
                            </TabBody>
                        {/if}
                    </TabBlock>

                {:else}

                    {#if graph}
                        <!-- Directions viewer. -->
                        <div class="directions-container">
                            <DirectionsViewer
                                {graph}
                                {graphWidgetStyle}
                                {useTabbedLayout}
                            />
                        </div>

                        <!-- Spaces viewer. -->
                        <div class="spaces-container">
                            <SpacesViewer
                                {graph}
                                {graphWidgetStyle}
                                {useTabbedLayout}
                                {setGraphSpace}
                            />
                        </div>
                    {/if}

                {/if}

            </div>

        <!-- Graph settings viewer. -->
        {:else if openedSubMenuName === "Settings"}
            {#if graph}
                <GraphSettingsViewer
                    bind:graph
                    bind:graphWidgetStyle
                    bind:allowZoomAndScrollToFit
                />
            {/if}

        <!-- File viewer. -->
        {:else if openedSubMenuName === "File"}
            <FileViewer />

        <!-- Developer menu. -->
        {:else if openedSubMenuName === "Dev"}
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
                
                    <!-- Stores tab. --> 
                    <TabBody>
                        <TabBlock>
                            <TabFlaps>
                                <TabFlap>Directions</TabFlap>
                                <TabFlap>Spaces</TabFlap>
                                <TabFlap>Things</TabFlap>
                            </TabFlaps>
                        
                            <!-- Directions Store view. --> 
                            <TabBody>
                                <DirectionsStoreViewer />
                            </TabBody>
                        
                            <!-- Spaces Store view. --> 
                            <TabBody>
                                <SpacesStoreViewer />
                            </TabBody>
                        
                            <!-- Things Store view. --> 
                            <TabBody>
                                <ThingsStoreViewer />
                            </TabBody>
                        </TabBlock>
                    </TabBody>
                
                    <!-- Database tab. --> 
                    <TabBody>
                        <DbLatestViewer />
                    </TabBody>
                </TabBlock>
                
            </div>

        <!-- About menu. -->
        {:else if openedSubMenuName === "About"}
            <AboutMenu />
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
            bind:rightMenuOpen
            bind:closeRightMenu
            bind:rePerspectToThingId
            bind:back
            bind:forward
            bind:setGraphSpace
        />

    <!-- Waiting indicator. -->
    {:else}
        <WaitingIndicator
            states={graphIndicatorStates}
            currentStateName={$loadingState}
        />
    {/if}

</main>


<style>
    main {
        flex-grow: 1;

        height: 100%;
        max-height: 100%;

        display: flex;
        flex-direction: row;

        overflow: hidden;

        font-family: Arial;
    }

    :global(main.reorderRow *) {
        cursor: col-resize;
    }

    :global(main.reorderColumn *) {
        cursor: row-resize;
    }

    .navigation-view {
        height: 100%;

        display: flex;
        flex-direction: column;

        overflow-x: hidden;
        overflow-y: hidden;
    }

    .pins-history-container {
        flex: 1 1 auto;

        position: relative;

        display: flex;
        flex-direction: column;

        overflow:hidden;
    }

    .back-and-forth-buttons {
        position: absolute;
        right: -2px;
        top: -2px;

        display: flex;
        flex-direction: row;
        padding: 5px;
        gap: 5px;
    }

    .back-and-forth-buttons.on-mobile {
        right: 0;
        top: 0;
    }

    button {
        height: 29px;

        padding-top: 2px;

        font-size: 1.25rem;
        font-family: Serif;
    }

    .back-and-forth-buttons.on-mobile button {
        line-height: 5px;
    }

    .history-container {
        flex: 1 1 auto;

        overflow: hidden;
    }

    .pins-container {
        overflow: hidden;
    }

    .directions-spaces-container {
        position: relative;
        height: 100%;

        display: flex;
        flex-direction: column;
    }

    .directions-container {
        height: 33%;
    }

    .spaces-container {
        height: 67%;

        scrollbar-width: thin;
    }

    .tabs-container {
        width: 100%;
        height: 100%;
        background-color: white;;
        
        overflow-x: hidden;
        overflow-y: hidden;
    }
</style>