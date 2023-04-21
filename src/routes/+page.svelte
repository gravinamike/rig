<script lang="ts">
    // Import types.
    import type { MenuName, WaitingIndicatorStates } from "$lib/shared/constants"
    import type { Graph, Space } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"

    // Import basic framework resources.
    import { onMount } from "svelte"

    // Import UUID resources.
    import { v4 as uuidv4 } from "uuid"

    // Import constants.
    import { startingGraphDepth } from "$lib/shared/constants"

    // Import stores.
    import {
        devMode, fontNames, urlStore, sessionUuidStore, leftSideMenuStore, loadingState,
        openGraphStore, perspectiveThingIdStore, reorderingInfoStore,
        updateMousePosition, updateRelationshipBeingCreatedEndpoint,
        uITrimColorStore, graphBackgroundImageStore, hideMenusStore, directionEditingInProgressIdStore, spaceEditingInProgressIdStore





    } from "$lib/stores"

    // Import widgets.
    import {
        WaitingIndicator, ContextCommandPalette, SideMenu, TabBlock, TabFlap, TabFlaps, TabBody
    } from "$lib/widgets/layoutWidgets"
    import { 
        NewFileWidget, RemoteRelatingWidget, ThingLinkingWidget, TextHyperlinkingWidget,
        RelationshipReorderController
    } from "$lib/widgets/dialogWidgets"

    // Import viewers.
    import AboutMenu from "$lib/viewers/about.svelte"
    import FileViewer from "$lib/viewers/settingsViewers/fileViewer.svelte"
    import {
        ThingSearchboxViewer, PinsViewer, HistoryViewer, 
        DirectionsViewer, SpacesViewer
    } from "$lib/viewers/navViewers"
    import { GraphSettingsViewer } from "$lib/viewers/settingsViewers"
    import { GraphSchematicViewer } from "$lib/viewers/graphViewers"
    import { DirectionsStoreViewer, SpacesStoreViewer, ThingsStoreViewer } from "$lib/viewers/storeViewers"
    import { DbLatestViewer } from "$lib/viewers/dbViewers"    
    import { GraphViewer } from "$lib/viewers/graphViewers"

    // Import related widgets.
    import { defaultGraphWidgetStyle, RelationshipBeingCreatedWidget } from "$lib/widgets/graphWidgets"

    // Import API methods.
    import { getFontNames } from "$lib/db/clientSide/getInfo"
    import { storeAppConfig } from "$lib/shared/config"
    import { openGraphFile } from "$lib/shared/unigraph"
    import { onMobile, stringRepresentsInteger, urlHashToObject } from "$lib/shared/utility"

    // Session UUID.
    sessionUuidStore.set( uuidv4() )
    
    // HTML element attributes.
    let height: number
    
    // Starting states for waiting indicator.
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

    // Configuration for left side-menu.
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
        ].filter(
            info => info !== null
            && !($hideMenusStore || []).includes(info.name as MenuName)
        ) as { name: MenuName, icon: string }[],

        $loadingState === "graphLoaded" ? [
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
            ].filter(
                info => info !== null
                && !($hideMenusStore || []).includes(info.name as MenuName)
            ) as { name: MenuName, icon: string }[] :
            null
    ].filter(infoBlock => infoBlock !== null) as ({ name: MenuName, icon: string }[])[]
    let leftMenuOpen: boolean
    let leftMenuLockedOpen: boolean
    let openedSubMenuName: string | null
    $: defaultOpenSubMenuName = $loadingState === "graphLoaded" ? "Thing" : "File"
    let lockedSubMenuName: string | null
    $: useTabbedLayout = height < 500
    let closeLeftMenu: () => {}

    // Configuration for right side-menu.
    let rightMenuOpen: boolean
    let closeRightMenu: () => {}

    // When on mobile with narrow viewport, set up each side-menu to close if
    // the other is open.
    $: if (onMobile() && window.innerWidth < 600 && leftMenuOpen) closeRightMenu()
    $: if (onMobile() && window.innerWidth < 600 && rightMenuOpen) closeLeftMenu()

    // Initialize open-Graph store.
    openGraphStore.set(null)


    // Graph parameters derived from the URL hash.
    let urlHashParams: { [key: string]: string } = {}
    $: urlHashParams = urlHashToObject($urlStore.hash)
    $: urlGraphFolder = "graph" in urlHashParams ? urlHashParams["graph"] : null
    $: urlThingId =
        "thingId" in urlHashParams && stringRepresentsInteger(urlHashParams["thingId"]) ? parseInt(urlHashParams["thingId"]) :
        null
    $: urlSpaceId = 
        "spaceId" in urlHashParams && stringRepresentsInteger(urlHashParams["spaceId"]) ? parseInt(urlHashParams["spaceId"]) :
        null

    // Attributes handled by the Graph Viewer.
    let graph: Graph | null
    let graphWidgetStyle: GraphWidgetStyle = {...defaultGraphWidgetStyle}
    let allowZoomAndScrollToFit: boolean
    let rePerspectToThingId: (thingId: number, updateHistory?: boolean, zoomAndScroll?: boolean) => Promise<void>
    let back: () => void
    let forward: () => void
    let setGraphSpace: (space: Space | number) => void

    
    /**
     * Load-app-config method.
     * 
     * Loads development-mode flag, font names and all config options stored
     * in the app-level config.json file.
     */
    async function loadAppConfig() {
        if (!mounted) return

        $loadingState = "configLoading"

        // Store development-mode flag.
        devMode.set(import.meta.env.MODE === "development")

        // Store font names.
        const apiFontNames = await getFontNames()
        if (apiFontNames) fontNames.set(apiFontNames)

        // Store app config.
        await storeAppConfig()
        
        $loadingState = "configLoaded"
    }

    /**
     * Open-Graph method.
     * 
     * Loads a Graph by filename, with the option to specify the starting
     * Perspective Thing as well.
     * @param graphName - The name of the Graph file to be opened.
     * @param pThingId - The ID of the Perspective Thing to start on, if not the Graph's default.
     */
    async function openGraph(graphName: string, pThingId: number | null = null) {
        if (!mounted) return

        // Close any existing Graph.
        graph = null

        // Open the Graph.
        await openGraphFile(graphName, pThingId, true)

        // Configure the left side-menu based on the Graph.
        leftMenuOpen = !!$leftSideMenuStore
        leftMenuLockedOpen = !!$leftSideMenuStore
        openedSubMenuName = $leftSideMenuStore
        lockedSubMenuName = $leftSideMenuStore
    }
    
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
    let mounted = false
    onMount(async () => {
        mounted = true

        // Load the app config.
        await loadAppConfig()
        
        // Open the Graph currently specified in the store.
        if (urlGraphFolder) {
            await openGraph(urlGraphFolder, urlThingId)
        } else {
            leftSideMenuStore.set("File")
            leftMenuOpen = !!$leftSideMenuStore
            leftMenuLockedOpen = !!$leftSideMenuStore
            openedSubMenuName = $leftSideMenuStore
            lockedSubMenuName = $leftSideMenuStore
        }
	})

    
    // Set up reactive Graph loading when the Graph parameter in the URL
    // changes.
    $: if (urlGraphFolder) openGraph(urlGraphFolder)

    // Set up reactive re-Perspecting and Space-changing that should happen
    // after Graph is loaded.
    function rePerspectIfAble(pThingId: number) {
        if (
            mounted
            && $loadingState === "graphLoaded"
            && graph?.pThing
            && graph.pThing.id !== pThingId
            && graph.pThing.id !== urlThingId
        ) rePerspectToThingId(pThingId)
    }
    $: if (urlThingId) rePerspectIfAble(urlThingId)
    function setGraphSpaceIfAble(spaceId: number) {
        if (
            mounted
            && graph
            && graph.lifecycleStatus !== "building"
            && graph.pThing?.space?.id !== spaceId
        ) setGraphSpace(spaceId)
    }
    $: if (urlSpaceId) setGraphSpaceIfAble(urlSpaceId)




    $: graphBackgroundImageUrl =
        $graphBackgroundImageStore ? `customizable/background-images/${$graphBackgroundImageStore}` :
        null



</script>


<!-- Set page title based on open Graph. -->
<svelte:head>
    <title>{ $openGraphStore ? $openGraphStore : "Rig" }</title>
</svelte:head>


<!-- Main app UI. -->
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

    {#if $loadingState === "graphLoaded"}
        <div
            class="background-image"

            style={
                graphBackgroundImageUrl ? `
                    background-image: url(${graphBackgroundImageUrl});
                    background-size: cover;
                ` :
                `
                    background-color: #eef8ff;
                `
            }
        />
    {/if}
    
    <!-- Front pane for context menus and command palettes. -->
    <ContextCommandPalette />

    <!-- Front pane for new file dialog. -->
    <NewFileWidget />

    <!-- Front pane for Relationship-being-created Widget. -->
    <RelationshipBeingCreatedWidget />

    <!-- Front pane for Remote-relating Widget. -->
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
        bind:open={leftMenuOpen}
        bind:lockedOpen={leftMenuLockedOpen}
        bind:openedSubMenuName
        bind:lockedSubMenuName
        overlapPage={false}
        stateStore={leftSideMenuStore}
        bind:close={closeLeftMenu}
    >
        <!-- Thing menu. -->
        {#if openedSubMenuName === "Thing"}
            <div class="navigation-view">
                <!-- Thing searchbox. -->
                <div
                    class="search-container"

                    style="background-color: {$uITrimColorStore};"
                >
                    <ThingSearchboxViewer
                        {rePerspectToThingId}
                        padded={false}
                    />
                </div>

                <div
                    class="pins-history-container"

                    style="background-color: {$uITrimColorStore};"
                >

                    {#if useTabbedLayout}

                        <TabBlock>
                            <TabFlaps>
                                <TabFlap><span class="tab-flap-span">Pins</span></TabFlap>
                                <TabFlap><span class="tab-flap-span">History</span></TabFlap>
                            </TabFlaps>
                        
                            <!-- Graph Pins viewer -->
                            <TabBody>
                                <PinsViewer
                                    {graph}
                                    {useTabbedLayout}
                                    {rePerspectToThingId}
                                />
                            </TabBody>

                            <!-- Graph History viewer -->
                            <TabBody>
                                {#if graph}
                                    <HistoryViewer
                                        bind:graph
                                        {useTabbedLayout}
                                        {rePerspectToThingId}
                                    />
                                {/if}
                            </TabBody>
                        </TabBlock>

                    {:else}

                        <!-- Graph Pins viewer -->
                        <div
                            class="pins-container"

                            style={
                                onMobile() && window.innerHeight < 500 ? "height: 50%" :
                                ""
                            }
                        >
                            <PinsViewer
                                {graph}
                                {useTabbedLayout}
                                {rePerspectToThingId}
                            />
                        </div>

                        <!-- Graph History viewer -->
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

                    {/if}
                    
                </div>
            </div>

        <!-- Space menu. -->
        {:else if openedSubMenuName === "Space"}
            <div
                class="spaces-view"

                style="background-color: {$uITrimColorStore};"
            >
                <div class="directions-spaces-container">

                    <TabBlock>
                        <TabFlaps>
                            <TabFlap><span class="tab-flap-span">Spaces</span></TabFlap>
                            <TabFlap><span class="tab-flap-span">Directions</span></TabFlap>
                        </TabFlaps>
    
                        {#if graph}                    
                            <TabBody>
                                <SpacesViewer
                                    {graph}
                                    {graphWidgetStyle}
                                    {setGraphSpace}
                                />
                            </TabBody>
    
                            <TabBody>
                                <DirectionsViewer
                                    {graph}
                                    {graphWidgetStyle}
                                />
                            </TabBody>
                        {/if}
                    </TabBlock>
    
                </div>
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
    {#if $loadingState === "graphLoaded"}
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

    .background-image {
        position: absolute;
        width: 100vw;
        height: 100vh;
    }

    .navigation-view {
        height: 100%;

        display: flex;
        flex-direction: column;

        overflow-x: hidden;
        overflow-y: hidden;
    }

    .search-container {
        padding: 0.5rem;
        gap: 0.5rem;
    }

    .pins-history-container {
        flex: 1 1 auto;

        position: relative;

        display: flex;
        flex-direction: column;
        padding: 0 0.5rem 0.5rem 0.5rem;
        gap: 0.5rem;

        overflow:hidden;
    }

    .history-container {
        flex: 1 1 auto;

        overflow: hidden;
    }

    .pins-container {
        overflow: hidden;
    }

    .spaces-view {
        box-sizing: border-box;
        height: 100%;

        display: flex;
        flex-direction: column;
        padding: 0.5rem;
    }

    .directions-spaces-container {
        flex: 1 1 auto;

        border-radius: 5px;

        position: relative;
        height: 100%;

        display: flex;
        flex-direction: column;
    }

    .tabs-container {
        width: 100%;
        height: 100%;
        
        overflow-x: hidden;
        overflow-y: hidden;
    }

    .tab-flap-span {
        font-size: 0.9rem;
        font-weight: 600;
    }
</style>