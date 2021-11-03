<script lang="ts">
    import type { ThingWidgetModel, Graph } from "$lib/shared/graph/graph"
    import CohortWidget from "$lib/components/graphWidgets/cohortWidget.svelte"
    import ThingDetailsWidget from "$lib/components/graphWidgets/thingDetailsWidget.svelte"

    export let thingWidgetModel: ThingWidgetModel
    export let graph: Graph
    
    $: thingId = thingWidgetModel.thingId
    $: text = thingWidgetModel.text
    $: note = thingWidgetModel.note
    $: cohorts = thingWidgetModel.childCohorts
    const showNotes = false
    let showDetails = false
    let lockDetails = false

    async function handleClick() {
        await graph.pThingIds([thingId]) // Re-Perspect to this Thing.
        graph = graph // Needed for reactivity.
    }
</script>


<main class="thing-widget">
    
    <!-- The Thing itself. -->
    <div class="box thing-image" on:click={handleClick}>
        <h1>{text}</h1>
        {#if ( showDetails || lockDetails ) && thingWidgetModel.thing}
            <div class="thing-details-container">
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

    <!-- The Thing's child Cohorts. -->
    {#each cohorts as cohort}
        <CohortWidget
            {cohort}
            bind:graph
        />
    {/each}

</main>


<style>
    .box {
        box-sizing: border-box;
        padding: 1rem;
        height: max-content;
        text-align: left;
        background-color: white;
        border-radius: 8px;
        box-shadow: 5px 5px 10px 2px lightgray;
    }

    .thing-image {
        position: relative;
        width: 80px;
        height: 80px;
        font-size: 0.35rem;
        font-weight: 400;
        overflow-wrap: break-word;
    }

    .thing-image:hover {
        box-shadow: 5px 5px 10px 10px lightgray;
    }

    .thing-details-container {
        position: absolute;
        top: 50px;
        left: 50px;
    }

    .toggle-button {
        position: absolute;
        bottom: 1px;
        right: 1px;
        height: 16px;
        width: 16px;
        text-align: center;
        font-size: 0.5rem;
        color: lightgrey;
        border-radius: 8px;
        outline: solid 1px lightgrey;
        outline-offset: -1px;
        cursor: pointer;
    }

    .toggle-button.pressed {
        background-color: gainsboro;
    }
</style>