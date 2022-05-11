<script lang="ts">
    import type { Graph } from "$lib/models/graphModels/graph"
    import type { ThingDbModel } from "$lib/models/dbModels"
    import { pinIdsStore, storeGraphConstructs, graphConstructInStore, retrieveGraphConstructs } from "$lib/stores"
    import { PinWidget } from "$lib/widgets/navWidgets"

    export let graph: Graph
    export let rePerspectToThingId: (thingId: number) => Promise<void>

    $: $pinIdsStore.forEach(
        async (pinId) => {
            if (!graphConstructInStore("Thing", pinId)) await storeGraphConstructs<ThingDbModel>("Thing", pinId)
        }
    )
    $: pins = $pinIdsStore.map(
        (pinId) => {
            graph // Needed for reactivity.
            return {
                thingId: pinId,
                thing: graphConstructInStore("Thing", pinId) ? retrieveGraphConstructs("Thing", pinId) as ThingDbModel : null
            }
        }
    )
</script>


<main>
    <h4>Pins</h4>

    {#each pins as pin (pin.thingId)}
        <PinWidget
            thingId={pin.thingId}
            thing={pin.thing}
            {rePerspectToThingId}
        />
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