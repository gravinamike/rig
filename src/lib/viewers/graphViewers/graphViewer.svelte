<script lang="ts">
    // Basic UI imports.
    import { onMount } from "svelte"
    import { sleep } from "$lib/shared/utility"
    import { Collapser, TabBlock, TabFlap, TabFlaps, TabBody } from "$lib/widgets/layoutWidgets"

    // Graph model imports.
    import { Graph } from "$lib/models/graphModels"

    // Side-interface imports.
    import { GraphSettingsViewer } from "$lib/viewers/settingsViewers"
    import { GraphSchematicViewer, GraphWidget } from "$lib/viewers/graphViewers"
    import { HistoryViewer, PinsViewer } from "$lib/viewers/navViewers"
    import { NotesViewer } from "$lib/viewers/notesViewers"
    import { FolderViewer } from "$lib/viewers/folderViewers"

    // Portal-related imports.
    import { hoveredThingIdStore } from "$lib/stores"
    
    export let pThingIds: number[]
    export let depth: number


    // Initialize the Graph.
    let graph = new Graph(pThingIds, depth)

    onMount(async () => {
        // Build the Graph.
        await graph.build()
        //graph.allowZoomAndScrollToFit = true
        graph = graph // Needed for reactivity.
	})

    async function rePerspectToThingId(thingId: number) {
        graph.allowScrollToThingId = true
        graph.thingIdToScrollTo = thingId
        graph = graph // Needed for reactivity.
        await sleep(500) // Allow for scroll time (since there's no actual feedback from the Portal to `await`).

        await graph.setPThingIds([thingId]) // Re-Perspect to this Thing.
        graph.addEntriesToHistory([thingId]) // Add this Thing to the History.
        hoveredThingIdStore.set(null) // Clear the hovered-Thing highlighting.
        graph.allowZoomAndScrollToFit = true
        graph = graph // Needed for reactivity.
    }
</script>


<main>
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
                    <TabFlap>Attachments</TabFlap>
                </TabFlaps>
            
                <!-- Notes viewer -->
                <TabBody>
                    <NotesViewer
                        {graph}
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
</main>


<style>
    main {
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