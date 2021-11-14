<script lang="ts">
    import type { Graph } from "$lib/shared/graph/graph"
    import { retrieveThings, thingInStore } from "$lib/shared/stores"

    export let graph: Graph

    $: visitedThings = graph.perspectiveHistory.slice().reverse().map(
        (thingId) => { return thingInStore(thingId) ? retrieveThings(thingId) : null }
    )

    async function handleClick(thingId: number) {
        console.log(thingId)
        await graph.pThingIds([thingId]) // Re-Perspect to this Thing.
        graph.addThingIdsToHistory([thingId]) // Add this Thing to the History.
        graph = graph // Needed for reactivity.
    }
</script>


<main>
    <h4>History:</h4>

    {#each visitedThings as visitedThing}
        <div class="box" on:click={ () => { if (visitedThing) handleClick(visitedThing.id)} }>
            {#if visitedThing}
                {visitedThing.text}
            {:else}
                NOT FOUND IN STORE
            {/if}
        </div>
    {/each}
</main>


<style>
    main {
        outline: solid 1px lightgrey;
        outline-offset: -1px;

        box-sizing: border-box;
        width: 225px;
        height: 100%;
        background-color: #fafafa;

        overflow-x: hidden;
        overflow-y: auto;

        display: flex;
        flex-direction: column;
        padding: 0.75rem;
        gap: 0.75rem;
        
        text-align: center;
    }

    h4 {
        margin: 0;
    }

    .box {
        border-radius: 10px;
        box-shadow: 5px 5px 10px 2px lightgray;

        height: max-content;
        background-color: white;
        
        display: flex;
        flex-direction: column;
        padding: 1rem;
        gap: 10px;

        font-size: 0.75rem;
        text-align: left;
    }

    .box:hover {
        box-shadow: 5px 5px 10px 10px lightgray;
    }
  </style>