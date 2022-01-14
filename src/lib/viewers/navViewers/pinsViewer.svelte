<script lang="ts">
    import type { Graph } from "$lib/models/graphModels/graph"
    import type { Thing } from "$lib/models/dbModels/thing"
    import { pinIdsStore } from "$lib/stores/appStores"
    import { storeGraphConstructs, graphConstructInStore, retrieveGraphConstructs } from "$lib/stores/graphStores"
    import PinsViewerWidget from "$lib/widgets/graphWidgets/navWidgets/pinWidget.svelte"

    export let graph: Graph
    export let rePerspectToThingId: (thingId: number) => Promise<void>

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
                {rePerspectToThingId}
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