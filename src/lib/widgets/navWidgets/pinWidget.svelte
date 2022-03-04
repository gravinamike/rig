<script lang="ts">
    import type { Thing } from "$lib/models/dbModels"
    import { hoveredThingIdStore, openContextCommandPalette, removePin } from "$lib/stores"

    export let thingId: number
    export let thing: Thing | null
    export let rePerspectToThingId: (thingId: number) => Promise<void>

    
    $: thingText = thing?.text || `(THING ${thingId} NOT FOUND IN STORE)`

    let hoveredThingIdStoreValue: number | null
    hoveredThingIdStore.subscribe(value => {hoveredThingIdStoreValue = value})

    function openCommandPalette(event: MouseEvent) {
        const position = [event.clientX, event.clientY] as [number, number]
        const buttonInfos = [{ text: "Remove Thing from Pins", iconName: "no-pin", onClick: () => {removePin(thingId)} }]
        openContextCommandPalette(position, buttonInfos)
    }
</script>


<div
    class="box { thingId === hoveredThingIdStoreValue ? "hovered-thing" : "" } { thing ? "" : "id-not-found" }"
    on:mouseenter={()=>{hoveredThingIdStore.set(thingId)}}
    on:mouseleave={()=>{hoveredThingIdStore.set(null)}}
    on:click={ () => { if (thing) rePerspectToThingId(thingId) } }
    on:contextmenu|preventDefault={openCommandPalette}
>
    {thingText}
</div>


<style>
    .box {
        border-radius: 10px;
        box-shadow: 5px 5px 10px 2px lightgray;

        position: relative;
        height: max-content;
        background-color: white;
        
        display: flex;
        flex-direction: column;
        padding: 1rem;
        gap: 10px;

        font-size: 0.65rem;
        text-align: left;

        cursor: default;
    }

    .box:hover {
        box-shadow: 5px 5px 10px 10px lightgray;
    }

    .hovered-thing {
        outline: solid 2px black;
    }

    .id-not-found {
        outline: dashed 1px black;
    }
  </style>