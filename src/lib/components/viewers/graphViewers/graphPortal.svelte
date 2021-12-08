<script lang="ts">
    import { onMount } from "svelte"
    import Collapser from "$lib/components/layoutElements/collapser.svelte"
    import { TabBlock, TabFlap, TabFlaps, TabBody } from "$lib/components/layoutElements/tabs"

    import { Graph } from "$lib/shared/graph/graph"

    import GraphSchematicView from "$lib/components/viewers/graphViewers/graphSchematicView.svelte"
    import GraphSettingsView from "$lib/components/viewers/settingsViewers/graphSettingsView.svelte"
    import GraphHistoryView from "$lib/components/viewers/graphViewers/graphHistoryView.svelte"
    import GraphPinsView from "$lib/components/viewers/graphViewers/graphPinsView.svelte"

    import CohortWidget from "$lib/components/graphWidgets/basicWidgets/cohortWidget.svelte"
    import PlaneControls from "$lib/components/controlElements/planeControls.svelte"
    import NotesViewer from "$lib/components/viewers/notesViewer/notesViewer.svelte"

    export let pThingIds: number[]
    export let depth: number


    // Initialize the Graph.
    let graph = new Graph(pThingIds, depth)

    onMount(async () => {
        // Build the Graph.
        await graph.build()
        graph = graph // Needed for reactivity.
	})
</script>


<main>

    <!-- Graph-related viewers (Schematic and Settings) -->
    <Collapser
        headerText={"Graph"}
        contentDirection={"left"}
    >
        <div class="tabs-container">
            <TabBlock>
                <TabFlaps>
                    <TabFlap>Settings</TabFlap>
                    <TabFlap>Schematic</TabFlap>
                </TabFlaps>
            
                <!-- Graph Settings viewer -->
                <TabBody>
                    <GraphSettingsView
                        bind:graph
                    />
                </TabBody>

                <!-- Graph Schematic viewer -->
                <TabBody>
                    <GraphSchematicView
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
            <div class="pins-container">
                <!-- Graph pins viewer -->
                <GraphPinsView
                    bind:graph
                />
            </div>

            <div class="history-container">
                <!-- Graph history viewer -->
                <GraphHistoryView
                    bind:graph
                />
            </div>
        </div>
    </Collapser>

    <!-- Graph Portal -->
    <div class="portal-container">
        <div class="portal">
            <div class="centralAnchor">
                {#if graph.rootCohort}
                    <CohortWidget
                        cohort={graph.rootCohort}
                        bind:graph
                    />
                {/if}
            </div>
            <div class="plane-controls-container">
                <PlaneControls
                    bind:graph
                />
            </div>
        </div>
    </div>

    <!-- Notes viewer -->
    <Collapser headerText={"Notes"} contentDirection={"right"}>
        <NotesViewer
            {graph}
        />
    </Collapser>

</main>


<style>
    main {
        flex-grow: 1;

        position: relative;

        display: flex;
        flex-direction: row;
    }

    .tabs-container {
        width: 200px;
        height: 100%;
        
        overflow: hidden;
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

    .portal-container {
        flex-grow: 1;

        outline: solid 1px lightgrey;
        outline-offset: -1px;

        position: relative;
    }

    .portal {
        width: 100%;
        height: 100%;

        overflow: auto;

        display: flex;
        justify-content: center;
        align-items: center;
        
        user-select: none;
    }

    .centralAnchor {
        position: relative;
        width: 0px;
        height: 0px;
    }

    .plane-controls-container {
        border-radius: 5px;
        box-shadow: 5px 5px 10px 2px lightgray;

        position: absolute;
        right: 20px;
        bottom: 20px;
    }
  </style>