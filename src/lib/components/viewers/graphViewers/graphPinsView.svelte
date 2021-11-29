<script lang="ts">
    import type { Graph } from "$lib/shared/graph/graph"
    import type { Thing } from "$lib/shared/graph/graphDbConstructs"
    import { pinIdsStore } from "$lib/shared/stores/appStores"
    import { storeGraphConstructs, graphConstructInStore, retrieveGraphConstructs } from "$lib/shared/stores/graphStores"
    import PinsViewerWidget from "$lib/components/viewers/graphViewers/pinsViewerWidget.svelte"

    export let graph: Graph

    $: $pinIdsStore.forEach(
        async (pinId) => {
            if (!graphConstructInStore("Thing", pinId)) await storeGraphConstructs<Thing>("Thing", pinId)
        }
    )
    $: pins = $pinIdsStore.map(
        (pinId) => {
            graph // Needed for reactivity.
            return {
                thingId: pinId,
                thing: graphConstructInStore("Thing", pinId) ? retrieveGraphConstructs("Thing", pinId) : null
            }
        }
    )
</script>


<main>
    <h4>Pins</h4>

    {#each pins as pin (pin.thingId)}
        {#if pin.thing}
            <PinsViewerWidget
                thingId={pin.thingId}
                thingText={pin.thing.text}
                bind:graph
            />
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
  </style>