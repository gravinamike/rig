<script lang="ts">
    import type { ThingWidgetModel, Graph } from "$lib/shared/graph/graph"
    import CohortWidget from "$lib/components/graphWidgets/cohortWidget.svelte"

    export let thingWidgetModel: ThingWidgetModel
    export let graph: Graph
    
    const thingId = thingWidgetModel.thingId
    const text = thingWidgetModel.text
    const note = thingWidgetModel.note
    const showNotes = false

    const cohorts = thingWidgetModel.childCohorts

    function handleClick() { console.log(thingId) }
</script>


<main class="thing-widget">
    
    <div class="thing-image" on:click={handleClick}>
        <h1>{thingId}: {text}</h1>
        {#if showNotes}
            {#if note}
                {@html note.text}
            {:else}
                <h2>NO NOTES YET</h2>
            {/if}
        {/if}
    </div>

    {#each cohorts as cohort}
        <CohortWidget
            {cohort}
            {graph}
        />
    {/each}

</main>


<style>
    .thing-image {
        width: 50px;
        height: 50px;
        padding: 1rem;
        font-size: 0.35rem;
        font-weight: 400;
        border-radius: 10px;
        box-shadow: 5px 5px 10px 2px lightgray;
    }
    .thing-image:hover {
        box-shadow: 5px 5px 10px 10px lightgray;
    }
</style>