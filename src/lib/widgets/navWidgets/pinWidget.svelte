<script lang="ts">
    /* Type imports. */
    import type { Thing } from "$lib/models/dbModels"

    /* Store-related imports. */
    import { hoveredThingIdStore, openContextCommandPalette, removePin } from "$lib/stores"


    /**
     * @param  {number} thingId - The ID of the Thing this Widget represents.
     * @param  {Thing | null} thing - The Thing this Widget represents.
     * @param  {(thingId: number) => Promise<void>} rePerspectToThingId - A function that re-perspects the Graph to a given Thing ID.
     */
    export let thingId: number
    export let thing: Thing | null
    export let rePerspectToThingId: (thingId: number) => Promise<void>


    // Store subscriptions.
    let hoveredThingIdStoreValue: number | null
    hoveredThingIdStore.subscribe(value => {hoveredThingIdStoreValue = value})

    // Reactive declarations.
    $: thingText = thing?.text || `(THING ${thingId} NOT FOUND IN STORE)`

    /**
     * Open a context command palette for this Pin.
     * @param  {MouseEvent} event - The mouse event that opens the command palette.
     */
    function openPinContextCommandPalette(event: MouseEvent) {
        const position: [number, number] = [ event.clientX, event.clientY ]
        const buttonInfos = [
            {
                text: "Remove Thing from Pins",
                iconName: "no-pin", onClick: () => {removePin(thingId)}
            }
        ]
        openContextCommandPalette(position, buttonInfos)
    }
</script>


<!-- Pin Widget. -->
<div
    class="
        pin-widget
        { thingId === hoveredThingIdStoreValue ? "hovered-thing" : "" }
        { thing ? "" : "thing-id-not-found" }
    "
    
    on:mouseenter={()=>{hoveredThingIdStore.set(thingId)}}
    on:mouseleave={()=>{hoveredThingIdStore.set(null)}}

    on:click={ () => { if (thing) rePerspectToThingId(thingId) } }
    on:contextmenu|preventDefault={ openPinContextCommandPalette }
>
    {thingText}
</div>


<style>
    .pin-widget {
        border-radius: 10px;
        box-shadow: 5px 5px 10px 2px lightgray;

        position: relative;
        height: max-content;
        background-color: white;
        
        display: flex;
        flex-direction: column;
        padding: 1rem;
        gap: 10px;

        text-align: left;
        font-size: 0.65rem;

        cursor: default;
    }

    .thing-id-not-found {
        outline: dashed 1px black;
    }

    .pin-widget:hover {
        box-shadow: 5px 5px 10px 10px lightgray;
    }

    .hovered-thing {
        outline: solid 2px black;
    }
  </style>