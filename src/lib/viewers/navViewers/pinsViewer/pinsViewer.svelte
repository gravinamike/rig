<script lang="ts">
    // Import types.
    import type { ThingDbModel } from "$lib/models/dbModels"
    import type { Graph, Thing } from "$lib/models/constructModels"
    
    // Import framework functions.
    import { flip } from "svelte/animate"

    // Import stores.
    import { pinIdsStore, storeGraphDbModels, graphDbModelInStore, getGraphConstructs, setPins, readOnlyMode, uIBackgroundColorStore } from "$lib/stores"

    // Import related widgets.
    import PinWidget from "./pinWidget.svelte"
    import { changeIndexInArray, onMobile } from "$lib/shared/utility"


    export let graph: Graph | null
    export let useTabbedLayout: boolean
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


<div
    class="pins-viewer"
    class:on-mobile={onMobile()}
    class:use-tabbed-layout={useTabbedLayout}

    style="background-color: {$uIBackgroundColorStore};"
>

    {#if !useTabbedLayout}
        <div class="title-container">
            <img
                src="./icons/pin.png"
                alt="History icon"
                width=27px
                height=27px
            >
            <div class="title">
                <h4>Pins</h4>
            </div>
        </div>
    {/if}
    

    <div
        class="content"
    >
        {#each pins as pin, index (pin.thingId)}
            <div
                draggable={ $readOnlyMode ? false : true }
                animate:flip={{ duration: 250 }}

                on:dragstart={ (event) => {if (!$readOnlyMode) startDragPin(event, index)} }
                on:dragover|preventDefault
                on:drop|preventDefault={ (event) => dropPin(event, index) }
            >
                <PinWidget
                    thingId={pin.thingId}
                    thing={pin.thing}
                    {graph}
                    {rePerspectToThingId}
                />
            </div>
        {/each}
    </div>
</div>


<style>
    .pins-viewer {
        border-radius: 5px;

        box-sizing: border-box;

        display: flex;
        flex-direction: column;
        padding: 0.5rem 0 0.5rem 0;
        gap: 0.25rem;
        
        text-align: center;

        overflow: hidden;
    }

    .pins-viewer.on-mobile {
        padding: 0.2rem 0 0.2rem 0;
        gap: 0.15rem;
    }

    .pins-viewer.use-tabbed-layout {
        border-radius: 0 0 5px 5px;

        height: 100%;
    }

    .pins-viewer:not(.use-tabbed-layout) {
        height: fit-content;
    }

    .title-container {
        margin-left: 0.5rem;
        
        display: flex;
        flex-direction: row;
        gap: 0.25rem;
        align-items: center;

        line-height: 21px;
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
        padding: 0.5rem;

        overflow-y: auto;
        scrollbar-width: thin;
    }
</style>