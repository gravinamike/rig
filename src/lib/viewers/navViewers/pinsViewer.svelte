<script lang="ts">
    import type { Thing } from "$lib/models/graphModels"
    import { pinIdsStore, storeGraphConstructs, graphConstructInStore, retrieveGraphConstructs } from "$lib/stores"
    import { PinWidget } from "$lib/widgets/navWidgets"

    export let rePerspectToThingId: (thingId: number) => Promise<void>


    let pins: { thingId: number, thing: Thing | null }[] = []
    async function storeAndGetPins(pinIds: number[]) {
        for (const pinId of pinIds) {
            if (!graphConstructInStore("Thing", pinId)) await storeGraphConstructs<Thing>("Thing", pinId)
        }

        pins = pinIds.map(
            (pinId) => {
                return {
                    thingId: pinId,
                    thing: graphConstructInStore("Thing", pinId) ? retrieveGraphConstructs("Thing", pinId) as Thing : null
                }
            }
        )
    }
    $: storeAndGetPins($pinIdsStore)
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