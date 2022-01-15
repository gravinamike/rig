<script lang="ts">
    import { hoveredThingIdStore, removePin } from "$lib/stores"
    import { ContextMenuFrame, ContextMenuOption } from "$lib/widgets/layoutWidgets"

    export let thingId: number
    export let thingText: string | null
    export let rePerspectToThingId: (thingId: number) => Promise<void>

    
    let contextMenu: ContextMenuFrame

    let hoveredThingIdStoreValue: number | null
    hoveredThingIdStore.subscribe(value => {hoveredThingIdStoreValue = value})
</script>


<div
    class="box { thingId === hoveredThingIdStoreValue ? "hovered-thing" : "" }"
    on:mouseenter={()=>{hoveredThingIdStore.set(thingId)}}
    on:mouseleave={()=>{hoveredThingIdStore.set(null)}}
    on:click={ () => { rePerspectToThingId(thingId) } }
    on:contextmenu|preventDefault={contextMenu.openContextMenu}
>
    {thingText}
    
    <ContextMenuFrame bind:this={contextMenu}>
        <ContextMenuOption
            text="Remove Thing from Pins"
            on:click={() => removePin(thingId)}
        />
    </ContextMenuFrame>
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
  </style>