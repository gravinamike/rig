<script lang="ts">
    import type { ThingWidgetModel, Graph } from "$lib/shared/graph/graph"
    import RelationshipsWidget from "$lib/components/graphWidgets/relationshipsWidget.svelte"
    import CohortWidget from "$lib/components/graphWidgets/cohortWidget.svelte"
    import ThingDetailsWidget from "$lib/components/graphWidgets/thingDetailsWidget.svelte"

    export let thingWidgetModel: ThingWidgetModel
    export let graph: Graph
    
    $: thingId = thingWidgetModel.thingId
    $: text = thingWidgetModel.text
    $: note = thingWidgetModel.note
    $: space = thingWidgetModel.space
    $: cohorts = thingWidgetModel.childCohorts
    $: thingSize = graph.format.thingSize
    const showNotes = false
    let showDetails = false
    let lockDetails = false

    async function handleClick() {
        await graph.pThingIds([thingId]) // Re-Perspect to this Thing.
        graph.addThingIdsToHistory([thingId]) // Add this Thing to the History.
        graph = graph // Needed for reactivity.
    }
</script>


<main class="thing-widget">
    
    <!-- The Thing itself. -->
    <div class="box thing-image" on:click={handleClick} style="width: {thingSize}px; height: {thingSize}px;">
        <h1 style="font-size: {graph.format.thingTextSize}px">
            {text}
        </h1>
        {#if ( showDetails || lockDetails ) && thingWidgetModel.thing}
            <div class="thing-details-container" style="top: {thingSize - 18}px; left: {thingSize - 18}px;">
                <ThingDetailsWidget
                    thing={thingWidgetModel.thing}
                />
            </div>
        {/if}
        <div
            class="toggle-button {showDetails || lockDetails ? "pressed" : ""}"
            on:click|stopPropagation={()=>{lockDetails = !lockDetails}}
            on:mouseenter={()=>{showDetails = true}}
            on:mouseleave={()=>{showDetails = false}}
            >
        </div>
    </div>

    {#if showNotes}
        {#if note}
            {@html note.text}
        {:else}
            <h2>NO NOTES YET</h2>
        {/if}
    {/if}

    <!-- The Thing's Relationships and child Cohorts. -->
    {#each cohorts as cohort (cohort.address)}
        {#if [1, 2, 3, 4].includes(cohort.address.halfAxisId)}
            <RelationshipsWidget
                {cohort}
                {space}
                {graph}
            />
        {/if}
        <CohortWidget
            {cohort}
            bind:graph
        />
    {/each}

</main>


<style>
    .box {
        border-radius: 8px;
        box-shadow: 5px 5px 10px 2px lightgray;

        box-sizing: border-box;
        height: max-content;
        background-color: white;

        padding: 1rem;
        
        text-align: left;
    }

    .thing-image {
        position: relative;

        font-size: 0.35rem;
        font-weight: 400;
        overflow-wrap: break-word;
    }

    .thing-image:hover {
        box-shadow: 5px 5px 10px 10px lightgray;
    }

    .thing-details-container {
        position: absolute;
    }

    .toggle-button {
        border-radius: 8px;
        outline: solid 1px lightgrey;
        outline-offset: -1px;
        
        position: absolute;
        bottom: 1px;
        right: 1px;
        height: 16px;
        width: 16px;

        text-align: center;
        font-size: 0.5rem;
        color: lightgrey;
        
        cursor: pointer;
    }

    .toggle-button.pressed {
        background-color: gainsboro;
    }
</style>