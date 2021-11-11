<script lang="ts">
    import { Graph } from "$lib/shared/graph/graph"
    import { onMount } from "svelte"
    import Collapser from "$lib/components/layoutElements/collapser.svelte"
    import GraphSchematicView from "$lib/components/viewers/graphSchematicView.svelte"
    import GraphSettingsView from "$lib/components/viewers/graphSettingsView.svelte"
    import CohortWidget from "$lib/components/graphWidgets/cohortWidget.svelte"

    export let pThingIds: number[]
    export let depth: number

    let graph = new Graph(pThingIds, depth)
    $: rootCohort = graph.rootCohort

    onMount(async () => {
        await graph.build()
        graph = graph // Needed for reactivity.
	})
</script>


<main>
    <Collapser headerText={"Graph schematic"} contentDirection={"left"} expanded={false}>
        <GraphSchematicView
            {graph}
        />
    </Collapser>

    <Collapser headerText={"Graph settings"} contentDirection={"left"} expanded={true}>
        <GraphSettingsView
            bind:graph
        />
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
</main>


<style>
    main {
        flex-grow: 1;
        display: flex;
        flex-direction: row;
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