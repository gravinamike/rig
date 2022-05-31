<script lang="ts">
    // Import basic framework functions.
    import { sleep } from "$lib/shared/utility"

    // Import stores.
    import { hoveredThingIdStore, openGraphStore, graphIdsNeedingViewerRefresh, addGraphIdsNeedingViewerRefresh, removeGraphIdsNeedingViewerRefresh } from "$lib/stores"

    // Import models.
    import { Graph } from "$lib/models/graphModels"

    // Import layout elements.
    import { Collapser, TabBlock, TabFlap, TabFlaps, TabBody } from "$lib/widgets/layoutWidgets"

    // Import viewers.
    import { GraphSettingsViewer } from "$lib/viewers/settingsViewers"
    import { GraphSchematicViewer } from "$lib/viewers/graphViewers"
    import { HistoryViewer, PinsViewer, ThingSearchboxViewer } from "$lib/viewers/navViewers"
    import { NotesViewer } from "$lib/viewers/notesViewers"
    import { FolderViewer } from "$lib/viewers/folderViewers"
    import { GraphWidget } from "$lib/widgets/graphWidgets"
    import { GraphOutlineWidget } from "$lib/widgets/graphWidgets"
    
    export let pThingIds: number[]
    export let depth: number


    // Initialize the Graph.
    let graph = new Graph(1, pThingIds, depth)

    // Set up Graph refreshing.
    $: if ( $graphIdsNeedingViewerRefresh.includes(graph.id) ) {
        removeGraphIdsNeedingViewerRefresh(graph.id)
        graph = graph // Needed for reactivity.
    }

    async function buildAndRefresh() {
        await graph.build()
        addGraphIdsNeedingViewerRefresh(graph.id)
    }
    
    /*onMount(async () => {
        // Build the Graph.
        
	})*/

    $: {
        openGraphStore

        buildAndRefresh()
    }

    /**
     * Re-Perspect the Graph to a given Thing ID.
     */
    async function rePerspectToThingId(thingId: number) {
        // If the new Perspective Thing is already in the Graph, scroll to center it.
        graph.allowScrollToThingId = true
        graph.thingIdToScrollTo = thingId
        addGraphIdsNeedingViewerRefresh(graph.id)
        await sleep(500) // Allow for scroll time (since there's no actual feedback from the Portal to `await`).

        // Re-Perspect the Graph
        await graph.setPThingIds([thingId]) // Re-Perspect to this Thing.
        hoveredThingIdStore.set(null) // Clear the hovered-Thing highlighting.
        graph.allowZoomAndScrollToFit = true
        addGraphIdsNeedingViewerRefresh(graph.id)

        // Add the new Perspective Thing to the History.
        graph.history.addEntries([thingId])
    }
</script>


<div class="graph-viewer">
    <!-- Graph-related viewers (Schematic and Settings) -->
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
            
                <!-- Graph Settings viewer -->
                <TabBody>
                    <GraphSettingsViewer
                        bind:graph
                    />
                </TabBody>

                <!-- Graph Schematic viewer -->
                <TabBody>
                    <GraphSchematicViewer
                        {graph}
                    />
                </TabBody>
            </TabBlock>
        </div>
    </Collapser>

    <!-- Navigation-related viewers (Pins and History) -->
    <Collapser
        headerText={"Navigation"}
        contentDirection={"left"}
        expanded={true}
    >
        <div class="navigation-view">
            <!-- Thing searchbox -->
            <div class="pins-container">
                <ThingSearchboxViewer
                    {rePerspectToThingId}
                />
            </div>

            <!-- Graph pins viewer -->
            <div class="pins-container">
                <PinsViewer
                    bind:graph
                    {rePerspectToThingId}
                />
            </div>

            <!-- Graph history viewer -->
            <div class="history-container">
                <HistoryViewer
                    bind:graph
                    {rePerspectToThingId}
                />
            </div>
        </div>
    </Collapser>

    <!-- Graph Widget -->
    <div class="graph-widget-container">
        <GraphWidget
            bind:graph
            {rePerspectToThingId}
        />
    </div>

    <!-- Notes viewer -->
    <Collapser headerText={"Content"} contentDirection={"right"} expanded={true}>
        <div class="tabs-container wide">
            <TabBlock>
                <TabFlaps>
                    <TabFlap>Notes</TabFlap>
                    <TabFlap>Outline</TabFlap>
                    <TabFlap>Attachments</TabFlap>
                </TabFlaps>
            
                <!-- Notes viewer -->
                <TabBody>
                    <NotesViewer
                        {graph}
                    />
                </TabBody>

                <!-- Outline viewer -->
                <TabBody>
                    <GraphOutlineWidget
                        bind:graph
                        {rePerspectToThingId}
                    />
                </TabBody>

                <!-- Attachments viewer -->
                <TabBody>
                    <FolderViewer
                        {graph}
                    />
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
        width: 200px;
        height: 100%;
        
        overflow: hidden;
    }

    .tabs-container.wide {
        width: auto;
    }

    .navigation-view {
        width: 150px;
        height: 100%;

        display: flex;
        flex-direction: column;

        overflow-x: hidden;
        overflow-y: auto;
    }

    .pins-container {
        flex: 0 0 auto;
    }

    .history-container {
        flex: 1 1 auto;
    }

    .graph-widget-container {
        flex: 1 1 auto;
        min-width: 0;

        outline: solid 1px lightgrey;
        outline-offset: -1px;

        position: relative;
    }
  </style>