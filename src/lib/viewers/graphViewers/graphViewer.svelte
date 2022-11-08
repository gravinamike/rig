<script lang="ts">
    // Type imports.
    import type { Graph, Space } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"
    
    // Import utility functions.
    import { sleep } from "$lib/shared/utility"

    // Import stores.
    import { addGraph, removeGraph, hoveredThingIdStore, openGraphStore, graphIdsNeedingViewerRefresh, addGraphIdsNeedingViewerRefresh, removeGraphIdsNeedingViewerRefresh, perspectiveThingIdStore } from "$lib/stores"

    // Import layout elements.
    import { Collapser, TabBlock, TabFlap, TabFlaps, TabBody } from "$lib/widgets/layoutWidgets"

    // Import viewers.
    import { GraphSettingsViewer } from "$lib/viewers/settingsViewers"
    import { GraphSchematicViewer } from "$lib/viewers/graphViewers"
    import { ThingSearchboxViewer, HistoryViewer, PinsViewer, DirectionsViewer, SpacesViewer } from "$lib/viewers/navViewers"
    import { NotesViewer } from "$lib/viewers/notesViewers"
    import { FolderViewer } from "$lib/viewers/folderViewers"
    import { defaultGraphWidgetStyle, GraphWidget, GraphOutlineWidget } from "$lib/widgets/graphWidgets"

    // Import API functions.
    import { markThingsVisited } from "$lib/db/clientSide/makeChanges"
    import { saveGraphConfig } from "$lib/shared/config";
    

    export let pThingIds: number[]
    export let depth: number


    // Graph and Graph widget style object.
    let graph: Graph | null
    let graphWidgetStyle: GraphWidgetStyle = {...defaultGraphWidgetStyle}

    // Show-Graph flag. This is a kludge, to ensure that the Graph widgets are
    // completely replaced at each re-Perspect to prevent retention of state
    // information.
    let showGraph = false

    // Attributes controlling zoom and scroll.
    let allowZoomAndScrollToFit = false
    let allowScrollToThingId = false
    let thingIdToScrollTo: number | null = null  

    /**
     * Build-and-refresh method.
     * Replaces any existing Graph with a new one, builds the new Graph, then
     * refreshes the viewers.
     */
    async function buildAndRefresh() {
        // Close any existing Graph.
        if (graph) {
            removeGraph(graph)
            graph = null
        }

        // Open and build the new Graph.
        graph = await addGraph(pThingIds, depth)
        graphWidgetStyle = {...defaultGraphWidgetStyle}
        await markThingsVisited(pThingIds)

        // Refresh the Graph viewers.
        showGraph = true
        addGraphIdsNeedingViewerRefresh(graph.id)
    }

    /**
     * Re-Perspect-to-Thing-ID method.
     * Re-builds the the Graph using the given Thing ID as the Perspective Thing.
     * 
     * @param thingId - The ID of the new Perspective Thing.
     */
    async function rePerspectToThingId(thingId: number) {
        if (graph) {
            // If the new Perspective Thing is already in the Graph, scroll to center it.
            allowScrollToThingId = true
            thingIdToScrollTo = thingId

            // Allow for scroll time (since there's no actual feedback from the widget to `await`).
            await sleep(300) 

            // Re-Perspect the Graph.
            showGraph = false
            await graph.setPThingIds([thingId]) // Re-Perspect to this Thing.
            showGraph = true

            // Clear the hovered-Thing highlighting.
            hoveredThingIdStore.set(null)

            // Refresh, then scroll and zoom to the new Graph.
            allowZoomAndScrollToFit = true
            addGraphIdsNeedingViewerRefresh(graph.id)

            // Update Thing-visit records in the database, History, store and Graph configuration.
            await markThingsVisited(pThingIds)
            graph.history.addEntries([thingId])
            perspectiveThingIdStore.set(thingId)
            saveGraphConfig()
        }
    }

    async function setGraphSpace(space: Space) {
        if (graph) {
            
            await graph.setSpace(space)
            
            addGraphIdsNeedingViewerRefresh(graph.id)
        }
    }

    // Set up viewer to refresh...
    // ... when a Graph is opened...
    $: {
        $openGraphStore

        buildAndRefresh()
    }
    // ... and whenever a refresh of the specific Graph ID is called for.
    $: if ( graph && $graphIdsNeedingViewerRefresh.includes(graph.id) ) {
        removeGraphIdsNeedingViewerRefresh(graph.id)
        graph = graph // Needed for reactivity.
        allowZoomAndScrollToFit = true
    }
</script>


<div class="graph-viewer">
    <!-- Graph-related viewers (Schematic and Settings). -->
    <Collapser
        headerText={"Graph"}
        contentDirection={"left"}
        expanded={false}
    >
        <div class="tabs-container">
            <TabBlock>
                <TabFlaps>
                    <TabFlap>Settings</TabFlap>
                    <TabFlap>Schematic</TabFlap>
                </TabFlaps>
            
                <!-- Graph Settings viewer. -->
                <TabBody>
                    {#if graph}
                        <GraphSettingsViewer
                            bind:graph
                            bind:graphWidgetStyle
                            bind:allowZoomAndScrollToFit
                        />
                    {/if}
                </TabBody>

                <!-- Graph Schematic viewer. -->
                <TabBody>
                    {#if graph}
                        <GraphSchematicViewer
                            {graph}
                        />
                    {/if}
                </TabBody>
            </TabBlock>
        </div>
    </Collapser>

    <!-- Perspective-related viewers (Navigation and Space). -->
    <Collapser
        headerText={"Perspective"}
        contentDirection={"left"}
        expanded={true}
    >
        <div class="tabs-container">
            <TabBlock>
                <TabFlaps>
                    <TabFlap>Navigation</TabFlap>
                    <TabFlap>Space</TabFlap>
                </TabFlaps>
            
                <!-- Navigation-related viewers (Search, History and Pins). -->
                <TabBody>
                    <div class="navigation-view">
                        <!-- Thing searchbox -->
                        <div class="search-container">
                            <ThingSearchboxViewer
                                {rePerspectToThingId}
                            />
                        </div>
            
                        <div class="history-pins-container">
                            <!-- Graph history viewer -->
                            {#if graph}
                                <div class="history-container">
                                    <HistoryViewer
                                        bind:graph
                                        {rePerspectToThingId}
                                    />
                                </div>
                            {/if}
            
                            <!-- Graph pins viewer -->
                            <div class="pins-container">
                                <PinsViewer
                                    {rePerspectToThingId}
                                />
                            </div>
                        </div>
                    </div>
                </TabBody>

                <!-- Space-related viewers. -->
                <TabBody>
                    <div class="directions-spaces-container">
                        <!-- Directions viewer -->
                        <div class="directions-container">
                            <DirectionsViewer
                            />
                        </div>
        
                        <!-- Spaces viewer -->
                        <div class="spaces-container">
                            <SpacesViewer
                                {graphWidgetStyle}
                                {setGraphSpace}
                            />
                        </div>
                    </div>
                </TabBody>
            </TabBlock>
        </div>
    </Collapser>

    <!-- Graph Widget -->
    <div class="graph-widget-container">
        {#if graph && showGraph}
            <GraphWidget
                bind:graph
                bind:graphWidgetStyle
                bind:allowZoomAndScrollToFit
                bind:allowScrollToThingId
                bind:thingIdToScrollTo
                {rePerspectToThingId}
            />
        {/if}
    </div>

    <!-- Notes viewer -->
    <Collapser headerText={"Content"} contentDirection={"right"} expanded={false}>
        <div class="tabs-container wide">
            <TabBlock>
                <TabFlaps>
                    <TabFlap>Notes</TabFlap>
                    <TabFlap>Outline</TabFlap>
                    <TabFlap>Attachments</TabFlap>
                </TabFlaps>
            
                <!-- Notes viewer -->
                <TabBody>
                    {#if graph}
                        <NotesViewer
                            {graph}
                            {rePerspectToThingId}
                        />
                    {/if}
                </TabBody>

                <!-- Outline viewer -->
                <TabBody>
                    <div class="graph-outline-widget-container">
                        {#if graph && showGraph}
                            <GraphOutlineWidget
                                bind:graph
                                {graphWidgetStyle}
                                {rePerspectToThingId}
                            />
                        {/if}
                    </div>
                </TabBody>

                <!-- Attachments viewer -->
                <TabBody>
                    {#if graph}
                        <FolderViewer
                            {graph}
                        />
                    {/if}
                </TabBody>
            </TabBlock>
        </div>
    </Collapser>
</div>


<style>
    .graph-viewer {
        flex: 1 1 auto;
        min-width: 0;

        position: relative;

        display: flex;
        flex-direction: row;
    }

    .tabs-container {
        width: 415px;
        height: 100%;
        
        overflow: hidden;
    }

    .tabs-container.wide {
        width: auto;
    }

    .navigation-view {
        height: 100%;

        display: flex;
        flex-direction: column;

        overflow-x: hidden;
        overflow-y: hidden;
    }

    .search-container {
        flex: 0 0 auto;
    }

    .history-pins-container {
        flex: 1 1 auto;

        position: relative;

        display: flex;
        flex-direction: column;

        overflow:hidden;
    }

    .history-container {
        flex: 1 1 auto;
        max-height: 66%;

        overflow: hidden;
    }

    .pins-container {
        flex: 1 1 auto;
        max-height: 66%;

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

    .graph-widget-container {
        flex: 1 1 auto;
        min-width: 0;

        outline: solid 1px lightgrey;
        outline-offset: -1px;

        position: relative;
        background-color: #eef8ff;
    }

    .graph-outline-widget-container {
        width: 750px;
        height: 100%;
        background-color: #fafafa;
    }
  </style>