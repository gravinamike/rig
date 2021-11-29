<script lang="ts">
    import type { SvelteComponent } from "svelte"
    import type { Graph } from "$lib/shared/graph/graph"
    import { pinIdsStore, hoveredThingIdStore, saveConfig } from "$lib/shared/stores/appStores"
    import { ContextMenuFrame, ContextMenuOption } from "$lib/components/layoutElements/contextMenu"

    export let thingId: number
    export let thingText: string | null
    export let graph: Graph

    
    let hoveredThingIdStoreValue: number | null
    hoveredThingIdStore.subscribe(value => {hoveredThingIdStoreValue = value})

    async function handleClick(thingId: number) {
        await graph.pThingIds([thingId]) // Re-Perspect to this Thing.
        graph.addEntriesToHistory([thingId]) // Add this Thing to the History.
        hoveredThingIdStore.set(null) // Clear the hovered-Thing highlighting.
        graph = graph // Needed for reactivity.
    }

    let contextMenu: SvelteComponent

    async function removePin(thingId: number) {
        pinIdsStore.update( (current) => {
            const index = current.indexOf(thingId)
            if (index !== -1) current.splice(index, 1)
            return current
        } )
        await saveConfig()
    }
</script>


<div
    class="box { thingId === hoveredThingIdStoreValue ? "hovered-thing" : "" }"
    on:mouseenter={()=>{hoveredThingIdStore.set(thingId)}}
    on:mouseleave={()=>{hoveredThingIdStore.set(null)}}
    on:click={ () => { handleClick(thingId) } }
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