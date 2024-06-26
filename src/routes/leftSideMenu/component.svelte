<script lang="ts">
    // Import types.
    import type { MenuName } from "$lib/shared/constants"
    import type { Graph, Space } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"

    // Import stores.
    import { leftSideMenuStore, mobileMenuTrimColorStore, uITrimColorStore, userIdStore, canAccessFileMenuStore } from "$lib/stores"

    // Import page controller.
    import LeftSideMenuController from "./controller.svelte"

    // Import widgets.
    import { SideMenu, TabBlock, TabFlap, TabFlaps, TabBody } from "$lib/widgets/layoutWidgets"

    // Import viewers.
    import AboutMenu from "$lib/menus/about.svelte"
    import { UsersMenu } from "$lib/menus/usersMenu"
    import FileMenu from "$lib/menus/fileMenu.svelte"
    import { ThingSearchboxViewer, PinsViewer, HistoryViewer } from "$lib/viewers/navViewers"
    import { DirectionsViewer, SpacesViewer } from "$lib/viewers/spaceViewers"
    import { GraphSettingsViewer } from "$lib/viewers/settingsViewers"
    import { GraphSchematicViewer } from "$lib/viewers/graphViewers"
    import { DirectionsStoreViewer, SpacesStoreViewer, ThingsStoreViewer } from "$lib/viewers/storeViewers"
    import { DbLatestViewer } from "$lib/viewers/dbViewers"   

    // Import related widgets.
    import { defaultGraphWidgetStyle } from "$lib/widgets/graphWidgets"
    import { Tooltip }  from "$lib/widgets/layoutWidgets"

    // Import API methods.
    import { onMobile } from "$lib/shared/utility"


    export let height: number
    export let graph: Graph | null
    export let graphWidgetStyle: GraphWidgetStyle = {...defaultGraphWidgetStyle}
    export let leftMenuOpen: boolean
    export let leftMenuLockedOpen: boolean
    export let openedSubMenuName: string | null
    export let lockedSubMenuName: string | null
    export let rePerspectToThingId: (thingId: number, updateHistory?: boolean, zoomAndScroll?: boolean) => Promise<void>
    export let setGraphSpace: (space: Space | number) => void


    // Attributes handled by left-side-menu controller.
    let subMenuInfos: { name: MenuName, icon: string, tooltipText: string | null }[][] = []
    let defaultOpenSubMenuName: string
    let useTabbedLayout: boolean = false
    let usePortraitLayout: boolean = false
    let closeLeftMenu: () => void






    let searchType: "thing" | "note" = "thing"
    let searchBoxFocused = false

    $: showFileMenu = (
        $canAccessFileMenuStore.includes("all")
        || ($userIdStore && $canAccessFileMenuStore.includes($userIdStore))
    )


    
</script>


<!-- Page controller. -->
<LeftSideMenuController
    {height}

    bind:subMenuInfos
    bind:defaultOpenSubMenuName
    bind:useTabbedLayout
    bind:usePortraitLayout
    {closeLeftMenu}
/>


<!-- Left side-menu. -->
<SideMenu
    {subMenuInfos}
    bind:openedSubMenuName
    bind:open={leftMenuOpen}
    bind:lockedOpen={leftMenuLockedOpen}
    bind:lockedSubMenuName
    openExtension={
        usePortraitLayout ? Math.min(window.innerWidth * 0.8, 300) :
        onMobile() ? 187 : 250
    }
    overlapPage={usePortraitLayout ? true: false}
    stateStore={leftSideMenuStore}
    closeOnOutsideClick={usePortraitLayout ? true : false}
    bind:close={closeLeftMenu}
>
    <!-- Spacer for menu buttons. -->
    <div
        class="spacer"

        style="background-color: {usePortraitLayout ? $mobileMenuTrimColorStore : $uITrimColorStore};"
    />

    <!-- Thing menu. -->
    {#if openedSubMenuName === "Thing"}
        <div class="navigation-view">

            <!-- Thing searchbox. -->
            <div
                class="search-container"

                style="background-color: {usePortraitLayout ? $mobileMenuTrimColorStore : $uITrimColorStore};"
            >
                <ThingSearchboxViewer
                    {rePerspectToThingId}
                    padded={false}
                    bind:focused={searchBoxFocused}
                    {searchType}
                />

                {#if !searchBoxFocused}
                    <div class="search-type-buttons">
                        <div
                            class="search-type-button"
                            class:selected={searchType === "thing"}

                            on:click={() => {searchType = "thing"}}
                            on:keydown={()=>{}}
                        >
                            <img src="./icons/thing.png" alt="Search Things" width=20px height=20px />
                            <Tooltip
                                text={"Search by Thing text."}
                                direction={"down"}
                                lean={"left"}
                            />
                        </div>
                        <div
                            class="search-type-button"
                            class:selected={searchType === "note"}

                            on:click={() => {searchType = "note"}}
                            on:keydown={()=>{}}
                        >
                            <img src="./icons/notes.png" alt="Search Notes" width=16px height=16px />
                            <Tooltip
                                text={"Search by Note text."}
                                direction={"down"}
                                lean={"left"}
                            />
                        </div>
                    </div>
                {/if}
            </div>

            <div
                class="pins-history-container"

                style="background-color: {usePortraitLayout ? $mobileMenuTrimColorStore : $uITrimColorStore};"
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
                            usePortraitLayout && window.innerHeight < 500 ? "height: 50%" :
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
                                usePortraitLayout && window.innerHeight < 500 ? "height: 50%" :
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
            class="tabs-container-outer"

            style="background-color: {usePortraitLayout ? $mobileMenuTrimColorStore : $uITrimColorStore};"
        >
            <div class="tabs-container-inner">

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
            />
        {/if}
    
    <!-- File viewer. -->
    {:else if openedSubMenuName === "File"}
        <div
            class="tabs-container-outer"

            style="background-color: {usePortraitLayout ? $mobileMenuTrimColorStore : $uITrimColorStore};"
        >
            <div class="tabs-container-inner">

                <TabBlock>
                    <TabFlaps>
                        {#if showFileMenu}
                            <TabFlap><span class="tab-flap-span">File</span></TabFlap>
                        {/if}
                        <TabFlap><span class="tab-flap-span">User</span></TabFlap>
                        <TabFlap><span class="tab-flap-span">About</span></TabFlap>
                    </TabFlaps>

                    <!-- File menu tab. -->
                    {#if showFileMenu}
                        <TabBody>
                            <FileMenu
                                bind:currentlyOpenGraph={graph}
                            />
                        </TabBody>
                    {/if}
                
                    <!-- Users tab. --> 
                    <TabBody>
                        <UsersMenu />
                    </TabBody>
                
                    <!-- About tab. --> 
                    <TabBody>
                        <AboutMenu />
                    </TabBody>
                </TabBlock>
            
            </div>

        </div>

    <!-- Developer menu. -->
    {:else if openedSubMenuName === "Dev"}
        <div
            class="tabs-container-outer"

            style="background-color: {usePortraitLayout ? $mobileMenuTrimColorStore : $uITrimColorStore};"
        >
            <div class="tabs-container-inner">

                <TabBlock>
                    <TabFlaps>
                        <TabFlap><span class="tab-flap-span">Schematic</span></TabFlap>
                        <TabFlap><span class="tab-flap-span">Stores</span></TabFlap>
                        <TabFlap><span class="tab-flap-span">Database</span></TabFlap>
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
                                <TabFlap><span class="tab-flap-span">Directions</span></TabFlap>
                                <TabFlap><span class="tab-flap-span">Spaces</span></TabFlap>
                                <TabFlap><span class="tab-flap-span">Things</span></TabFlap>
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
            
        </div>        
    {/if}
</SideMenu>


<style>
    .navigation-view {
        height: calc(100% - 43px);

        display: flex;
        flex-direction: column;

        overflow-x: hidden;
        overflow-y: hidden;
    }

    .spacer {
        height: 43px;
    }

    .search-container {
        position: relative;

        padding: 0.5rem;
        gap: 0.5rem;
    }





    .search-type-buttons {
        position: absolute;
        right: 11px;
        top: 11px;
        opacity: 0.5;

        display: flex;
        flex-direction: row;
    }

    .search-type-buttons:hover {
        opacity: 1.0;
    }

    .search-type-button {
        border-radius: 3px;

        position: relative;
        width: 20px;
        height: 20px;

        display: flex;
        align-items: center;
        justify-content: center;

        cursor: pointer;
    }

    .search-type-button img {
        opacity: 0.25;
    }

    .search-type-button.selected img {
        opacity: 1.0;
    }
    
    .search-type-button:hover {
        background: whitesmoke;
    }

    .search-type-button:active {
        background: gainsboro;
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

    .tabs-container-outer {
        box-sizing: border-box;
        height: calc(100% - 43px);

        display: flex;
        flex-direction: column;
        padding: 0.5rem;
    }

    .tabs-container-inner {
        flex: 1 1 auto;

        border-radius: 5px;

        position: relative;
        height: 100%;

        display: flex;
        flex-direction: column;
    }

    .tab-flap-span {
        font-size: 0.9rem;
        font-weight: 600;
    }
</style>