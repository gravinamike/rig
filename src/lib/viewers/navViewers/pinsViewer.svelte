<script lang="ts">
    import type { Thing } from "$lib/models/constructModels"
    import type { ThingDbModel } from "$lib/models/dbModels/clientSide";
    
    import { flip } from "svelte/animate"
    import { pinIdsStore, storeGraphDbModels, graphDbModelInStore, getGraphConstructs, setPins } from "$lib/stores"
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

    const drop = (event: DragEvent, destIndex: number) => {
        if (event.dataTransfer) {
            event.dataTransfer.dropEffect = "move"
            const reorderedPins = pins

            const sourceIndex = parseInt(event.dataTransfer.getData("text/plain"))
            if ( sourceIndex < destIndex ) {
                reorderedPins.splice(destIndex + 1, 0, reorderedPins[sourceIndex])
                reorderedPins.splice(sourceIndex, 1);
            } else {
                reorderedPins.splice(destIndex, 0, reorderedPins[sourceIndex])
                reorderedPins.splice(sourceIndex + 1, 1)
            }

            pins = reorderedPins
            // Update the store and the config file.
            setPins( pins.map(pin => pin.thingId) )
        }
    }
  
    const startDrag = (event: DragEvent, sourceIndex: number) => {
        if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = "move"
            event.dataTransfer.dropEffect = "move"

            event.dataTransfer.setData("text/plain", String(sourceIndex))
        }
    }
</script>


<div class="pins-viewer">
    <div class="title">
        <h4>Pins</h4>
    </div>

    <div class="content">
        {#each pins as pin, index (pin.thingId)}
            <div
                draggable=true
                animate:flip={{ duration: 250 }}

                on:dragstart={ (event) => startDrag(event, index) }
                on:dragover|preventDefault
                on:drop|preventDefault={ (event) => drop(event, index) }
            >
                <PinWidget
                    thingId={pin.thingId}
                    thing={pin.thing}
                    {rePerspectToThingId}
                />
            </div>
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