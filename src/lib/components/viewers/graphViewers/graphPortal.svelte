<script lang="ts">
    import { onMount } from "svelte"
    import { Graph } from "$lib/shared/graph/graph"
    import Collapser from "$lib/components/layoutElements/collapser.svelte"
    import { TabBlock, TabFlap, TabFlaps, TabBody } from "$lib/components/layoutElements/tabs"
    import GraphSchematicView from "$lib/components/viewers/graphViewers/graphSchematicView.svelte"
    import GraphSettingsView from "$lib/components/viewers/settingsViewers/graphSettingsView.svelte"
    import GraphHistoryView from "$lib/components/viewers/graphViewers/graphHistoryView.svelte"
    import GraphPinsView from "$lib/components/viewers/graphViewers/graphPinsView.svelte"
    import CohortWidget from "$lib/components/graphWidgets/basicWidgets/cohortWidget.svelte"
    import NotesViewer from "$lib/components/viewers/notesViewer/notesViewer.svelte"

    export let pThingIds: number[]
    export let depth: number

    let graph = new Graph(pThingIds, depth)
    $: rootCohort = graph.rootCohort

    onMount(async () => {
        await graph.build()
        graph.addEntriesToHistory(pThingIds)
        graph = graph // Needed for reactivity.
	})
</script>


<main>
    <Collapser headerText={"Graph"} contentDirection={"left"} expanded={false}>
        <div class="tabs-container">
            <TabBlock>
                <TabFlaps>
                    <TabFlap>Schematic</TabFlap>
                    <TabFlap>Settings</TabFlap>
                </TabFlaps>
            
                <!-- Graph Schematic view -->
                <TabBody>
                    <GraphSchematicView
                        {graph}
                    />
                </TabBody>
            
                <!-- Graph settings view -->
                <TabBody>
                    <GraphSettingsView
                        bind:graph
                    />
                </TabBody>
            </TabBlock>
        </div>
    </Collapser>

    <Collapser headerText={"Navigation"} contentDirection={"left"} expanded={true}>
        <div class="navigation-view">
            <div style="flex: 0 0 auto;">
                <!-- Graph pins view -->
                <GraphPinsView
                    bind:graph
                />
            </div>
            <div style="flex: 1 1 auto;">
                <!-- Graph history view -->
                <GraphHistoryView
                    bind:graph
                />
            </div>
        </div>
    </Collapser>

    <div class="portal">
        
        <div class="centralAnchor">
            {#if rootCohort}
                <CohortWidget
                    cohort={rootCohort}
                    bind:graph
                />
            {/if}
        </div>
    </div>

    <Collapser headerText={"Notes"} contentDirection={"right"} expanded={true}>
        <NotesViewer
            {graph}
        />
    </Collapser>
</main>


<style>
    main {
        flex-grow: 1;
        display: flex;
        flex-direction: row;
    }

    .tabs-container {
        width: 200px;
        height: 100%;
        
        overflow-x: hidden;
        overflow-y: hidden;
    }

    .navigation-view {
        width: 150px;
        height: 100%;

        display: flex;
        flex-direction: column;

        overflow-x: hidden;
        overflow-y: auto;
    }

    .portal {
        flex-grow: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: auto;
        outline: solid 1px lightgrey;
        outline-offset: -1px;
    }

    .centralAnchor {
        position: relative;
        width: 0px;
        height: 0px;
    }
  </style>