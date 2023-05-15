<script lang="ts">
    // Import types.
    import type { MenuName } from "$lib/shared/constants"
    import type { Graph, Space } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"

    // Import stores.
    import { leftSideMenuStore, uITrimColorStore } from "$lib/stores"

    // Import page controller.
    import LeftSideMenuController from "./controller.svelte"

    // Import widgets.
    import { SideMenu, TabBlock, TabFlap, TabFlaps, TabBody } from "$lib/widgets/layoutWidgets"

    // Import viewers.
    import AboutMenu from "$lib/viewers/about.svelte"
    import { UsersMenu } from "$lib/viewers/usersMenu"
    import FileViewer from "$lib/viewers/settingsViewers/fileViewer.svelte"
    import {
        ThingSearchboxViewer, PinsViewer, HistoryViewer, 
        DirectionsViewer, SpacesViewer
    } from "$lib/viewers/navViewers"
    import { GraphSettingsViewer } from "$lib/viewers/settingsViewers"
    import { GraphSchematicViewer } from "$lib/viewers/graphViewers"
    import { DirectionsStoreViewer, SpacesStoreViewer, ThingsStoreViewer } from "$lib/viewers/storeViewers"
    import { DbLatestViewer } from "$lib/viewers/dbViewers"   

    // Import related widgets.
    import { defaultGraphWidgetStyle } from "$lib/widgets/graphWidgets"

    // Import API methods.
    import { onMobile } from "$lib/shared/utility"


    export let height: number
    export let graph: Graph | null
    export let graphWidgetStyle: GraphWidgetStyle = {...defaultGraphWidgetStyle}
    export let allowZoomAndScrollToFit: boolean
    export let leftMenuOpen: boolean
    export let leftMenuLockedOpen: boolean
    export let openedSubMenuName: string | null
    export let lockedSubMenuName: string | null
    export let rePerspectToThingId: (thingId: number, updateHistory?: boolean, zoomAndScroll?: boolean) => Promise<void>
    export let setGraphSpace: (space: Space | number) => void


    // Attributes handled by left-side-menu controller.
    let subMenuInfos: { name: MenuName, icon: string }[][] = []
    let defaultOpenSubMenuName: string
    let useTabbedLayout: boolean = false
    let rightMenuOpen: boolean = false
    let closeLeftMenu: () => void = () => {}
    let closeRightMenu: () => void = () => {}
</script>


<!-- Page controller. -->
<LeftSideMenuController
    {height}

    bind:subMenuInfos
    bind:leftMenuOpen
    bind:defaultOpenSubMenuName
    bind:useTabbedLayout
    bind:rightMenuOpen
    bind:closeLeftMenu
    bind:closeRightMenu
/>


<!-- Left side-menu. -->
<SideMenu
    {subMenuInfos}
    {defaultOpenSubMenuName}
    bind:openedSubMenuName
    bind:open={leftMenuOpen}
    bind:lockedOpen={leftMenuLockedOpen}
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

    <!-- Users menu. -->
    {:else if openedSubMenuName === "Users"}
        <UsersMenu />
    
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


<style>
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