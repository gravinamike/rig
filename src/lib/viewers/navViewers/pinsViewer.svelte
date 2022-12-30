<script lang="ts">
    // Import types.
    import type { ThingDbModel } from "$lib/models/dbModels/clientSide"
    import type { Thing } from "$lib/models/constructModels"
    
    // Import framework functions.
    import { flip } from "svelte/animate"

    // Import stores.
    import { pinIdsStore, storeGraphDbModels, graphDbModelInStore, getGraphConstructs, setPins } from "$lib/stores"

    // Import related widgets.
    import { PinWidget } from "$lib/widgets/navWidgets"
    import { changeIndexInArray } from "$lib/shared/utility";


    export let rePerspectToThingId: (thingId: number) => Promise<void>


    // Pin information objects include IDs and associated Things.
    let pins: { thingId: number, thing: Thing | null }[] = []
    async function storeAndGetPins(pinIds: number[]) {
        // Store the Pins based on a database query.
        for (const pinId of pinIds) {
            if (!graphDbModelInStore("Thing", pinId)) await storeGraphDbModels<ThingDbModel>("Thing", pinId)
        }

        // Retrieve the Pins from the store.
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
  

    /**
     * Start-drag-Pin method.
     * 
     * Handles mouse-drag operations for reordering Pins.
     * @param event - The mouse-drag event that triggered this method.
     * @param sourceIndex - The index of the Pin that is being dragged.
     */
    const startDragPin = (event: DragEvent, sourceIndex: number) => {
        // If the event isn't transferring data, abort.
        if (!event.dataTransfer) return

        // Otherwise, set the specified Pin's starting index as the payload.
        event.dataTransfer.effectAllowed = "move"
        event.dataTransfer.dropEffect = "move"
        event.dataTransfer.setData("text/plain", String(sourceIndex))
    }

    /**
     * Drop-Pin method.
     * 
     * Handles drag-release operations for reordering Pins.
     * @param event - The drag-release event that triggered this method.
     * @param destIndex - The index of the Pin that is being hovered over, which will be swapped with the dragged Pin.
     */
    const dropPin = (event: DragEvent, destIndex: number) => {
        // If the event isn't transferring data, abort.
        if (!event.dataTransfer) return

        // Retrieve the specified Pin's starting index from the event.
        event.dataTransfer.dropEffect = "move"
        const sourceIndex = parseInt(event.dataTransfer.getData("text/plain"))

        // Reorder the Pins array to move the specified Pin from the source to
        // the destination index.
        let reorderedPins = (
            changeIndexInArray(pins, sourceIndex, destIndex) as { thingId: number, thing: Thing | null }[]
        )
        pins = reorderedPins

        // Update the store and the config file.
        setPins( pins.map(pin => pin.thingId) )
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

                on:dragstart={ (event) => startDragPin(event, index) }
                on:dragover|preventDefault
                on:drop|preventDefault={ (event) => dropPin(event, index) }
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
        height: fit-content;
        background-color: #fafafa;

        display: flex;
        flex-direction: column;
        padding: 0.75rem 0 0.75rem 0;
        gap: 0.5rem;
        
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
        display: flex;
        flex-direction: column;
        padding: 0.75rem;
        gap: 0.75rem;
    }
  </style>