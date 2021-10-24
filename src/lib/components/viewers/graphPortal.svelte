<script lang="ts">
    import type { Graph } from "$lib/shared/graph/graph"
    import CohortWidget from "$lib/components/graphWidgets/cohortWidget.svelte"

    export let graph: Graph
    $: rootCohort = graph.rootCohort
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