<script lang="ts">
    // Type imports.
    import type { Graph } from "$lib/models/graphModels"
    
    // Import basic framework functions.
    import { sleep } from "$lib/shared/utility"

    // Import stores.
    import { addGraph, removeGraph, hoveredThingIdStore, openGraphStore, graphIdsNeedingViewerRefresh, addGraphIdsNeedingViewerRefresh, removeGraphIdsNeedingViewerRefresh } from "$lib/stores"

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

    // Import modification functions.
    import { markThingsVisited } from "$lib/db/clientSide/makeChanges"
    import { GraphWidgetModel } from "$lib/models/widgetModels"
    
    export let pThingIds: number[]
    export let depth: number


    // Initialize the Graph.
    let graph: Graph | null
    let graphWidgetModel: GraphWidgetModel | null = null

    // Set up Graph refreshing.
    $: if ( graph && graphWidgetModel && $graphIdsNeedingViewerRefresh.includes(graph.id) ) {
        removeGraphIdsNeedingViewerRefresh(graph.id)
        graph = graph // Needed for reactivity.
        graphWidgetModel.allowZoomAndScrollToFit = true
    }

    async function buildAndRefresh() {
        // Close any existing Graph.
        if (graph) removeGraph(graph)

        // Open and build the new Graph.
        graph = await addGraph(pThingIds, depth)
        graphWidgetModel = new GraphWidgetModel(graph)
        await markThingsVisited(pThingIds)

        // Refresh the Graph viewers.
        addGraphIdsNeedingViewerRefresh(graph.id)
    }


    $: {
        openGraphStore

        buildAndRefresh()
    }

    $: if (graph && graph.lifecycleStatus === "built" && graphWidgetModel) {//////////////////// SHOULD WORK...
        graphWidgetModel.build()
    }

    

    /**
     * Re-Perspect the Graph to a given Thing ID.
     */
    async function rePerspectToThingId(thingId: number) {
        if (graph && graphWidgetModel) {
            // If the new Perspective Thing is already in the Graph, scroll to center it.
            graphWidgetModel.allowScrollToThingId = true
            graphWidgetModel.thingIdToScrollTo = thingId
            await sleep(300) // Allow for scroll time (since there's no actual feedback from the Portal to `await`).

            // Re-Perspect the Graph.
            await graph.setPThingIds([thingId]) // Re-Perspect to this Thing.
            hoveredThingIdStore.set(null) // Clear the hovered-Thing highlighting.
            graphWidgetModel.allowZoomAndScrollToFit = true
            addGraphIdsNeedingViewerRefresh(graph.id)
            await markThingsVisited(pThingIds)

            // Add the new Perspective Thing to the History.
            graph.history.addEntries([thingId])
        }
    }
    $: console.log("---------------------------------------------", graphWidgetModel) //////////////////// WHY IS THIS GOING NULL?
</script>


{#if graph && graph.lifecycleStatus === "built" && graphWidgetModel}
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
                            bind:graphWidgetModel
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
                bind:model={graphWidgetModel}
                {rePerspectToThingId}
            />
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
                        <NotesViewer
                            {graph}
                            {rePerspectToThingId}
                        />
                    </TabBody>

                    <!-- Outline viewer -->
                    <TabBody>
                        <div class="graph-outline-widget-container">
                            <GraphOutlineWidget
                                bind:graphWidgetModel
                                {rePerspectToThingId}
                            />
                        </div>
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
{/if}


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

    .graph-outline-widget-container {
        width: 750px;
        height: 100%;
        background-color: #fafafa;
    }
  </style>