<script lang="ts">
    import type { Thing } from "$lib/models/constructModels"
    import type { ThingDbModel } from "$lib/models/dbModels/clientSide";
    import { pinIdsStore, storeGraphDbModels, graphDbModelInStore, getGraphConstructs } from "$lib/stores"
    import { PinWidget } from "$lib/widgets/navWidgets"

    export let rePerspectToThingId: (thingId: number) => Promise<void>


    let pins: { thingId: number, thing: Thing | null }[] = []
    async function storeAndGetPins(pinIds: number[]) {
        for (const pinId of pinIds) {
            if (!graphDbModelInStore("Thing", pinId)) await storeGraphDbModels<ThingDbModel>("Thing", pinId)
        }

        pins = pinIds.map(
            (pinId) => {
                return {
                    thingId: pinId,
                    thing: graphDbModelInStore("Thing", pinId) ? getGraphConstructs("Thing", pinId) as Thing : null
                }
            }
        )
    }
    $: storeAndGetPins($pinIdsStore)
</script>


<div class="pins-viewer">
    <div class="title">
        <h4>Pins</h4>
    </div>

    <div class="content">
        {#each pins as pin (pin.thingId)}
            <PinWidget
                thingId={pin.thingId}
                thing={pin.thing}
                {rePerspectToThingId}
            />
        {/each}
    </div>
</div>


<style>
    .pins-viewer {
        outline: solid 1px lightgrey;
        outline-offset: -1px;

        box-sizing: border-box;
        height: 100%;
        background-color: #fafafa;

        display: flex;
        flex-direction: column;
        padding: 0.75rem 0 0.75rem 0;
        gap: 0.75rem;
        
        text-align: center;

        overflow: hidden;
    }

    .title {
        height: 20px;
    }

    h4 {
        margin: 0;
    }

    .content {
        flex: 1 1 0;

        display: flex;
        flex-direction: column;
        padding: 0.75rem;
        gap: 0.75rem;

        overflow-y: auto;
        scrollbar-width: thin;
    }
  </style>