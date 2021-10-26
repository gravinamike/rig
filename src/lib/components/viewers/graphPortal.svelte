<script lang="ts">
    import { Graph } from "$lib/shared/graph/graph"
    import { onMount } from "svelte"
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
    <div class="centralAnchor">
        {#if rootCohort}
            <CohortWidget
                cohort={rootCohort}
                bind:graph
            />
        {/if}
    </div>
</main>


<style>
    main {
        flex-grow: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: auto;
        outline: solid 1px;
    }
    .centralAnchor {
        position: relative;
        width: 0px;
        height: 0px;
    }
  </style>