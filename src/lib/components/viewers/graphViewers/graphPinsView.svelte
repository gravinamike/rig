<script lang="ts">
    import type { Graph } from "$lib/shared/graph/graph"
    import { pinIdsStore, hoveredThingIdStore } from "$lib/shared/stores/appStores"
    import { graphConstructInStore, retrieveGraphConstructs } from "$lib/shared/stores/graphStores"

    export let graph: Graph


    $: pins = $pinIdsStore.map(
        (pinId) => {
            graph // Needed for reactivity.
            return {
                thingId: pinId,
                thing: graphConstructInStore("Thing", pinId) ? retrieveGraphConstructs("Thing", pinId) : null
            }
        }
    )
    
    let hoveredThingIdStoreValue: number | null
    hoveredThingIdStore.subscribe(value => {hoveredThingIdStoreValue = value})

    async function handleClick(thingId: number) {
        await graph.pThingIds([thingId]) // Re-Perspect to this Thing.
        graph.addEntriesToHistory([thingId]) // Add this Thing to the History.
        hoveredThingIdStore.set(null) // Clear the hovered-Thing highlighting.
        graph = graph // Needed for reactivity.
    }
</script>


<main>
    <h4>Pins</h4>

    {#each pins as pin (pin.thingId)}
        {#if pin.thing}
            <div
                class="box { pin.thingId === hoveredThingIdStoreValue ? "hovered-thing" : "" }"
                on:mouseenter={()=>{hoveredThingIdStore.set(pin.thingId)}}
                on:mouseleave={()=>{hoveredThingIdStore.set(null)}}
                on:click={ () => { handleClick(pin.thingId) }
            }>
                {pin.thing.text}
            </div>
        {:else}
            <div>
                THING {pin.thingId} NOT FOUND IN STORE
            </div>
        {/if}
    {/each}
</main>


<style>
    main {
        outline: solid 1px lightgrey;
        outline-offset: -1px;

        box-sizing: border-box;
        width: 200px;
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

    .hovered-thing {
        outline: solid 2px black;
    }
  </style>