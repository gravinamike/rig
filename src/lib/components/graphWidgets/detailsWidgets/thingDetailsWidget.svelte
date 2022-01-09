<script lang="ts">
    import type { Thing } from "$lib/shared/graph/constructs/thing"
    import { hoveredThingIdStore } from "$lib/shared/stores/appStores"
    import Collapser from "$lib/components/layoutElements/collapser.svelte"

    export let thing: Thing

    let hoveredThingIdStoreValue: number | null
    hoveredThingIdStore.subscribe(value => {hoveredThingIdStoreValue = value})
    $: isHoveredThing = thing.id === hoveredThingIdStoreValue
</script>


<main>
    <div
        class="box { isHoveredThing ? "hovered-thing" : "" }"
        on:mouseenter={()=>{hoveredThingIdStore.set(thing.id)}}
        on:mouseleave={()=>{hoveredThingIdStore.set(null)}}
    >

        <h4>{`${thing.id} ${thing.text}`}</h4>

        <h4>Space: {thing.defaultplane}</h4>

        <Collapser headerText={"Related Things"}>
            <div class="related-things-list">

                <strong>A-relations:</strong>
                {#each thing.a_relationships as { id, direction, thingaid, thingbid }}
                    <p>Id: {id} Dir: {direction}</p>
                    <p>Id A: {thingaid} Id B: {thingbid}</p>
                {/each}

                <strong>B-relations:</strong>
                {#each thing.b_relationships as { id, direction, thingaid, thingbid }}
                    <p>Id: {id} Dir: {direction}</p>
                    <p>Id A: {thingaid} Id B: {thingbid}</p>
                {/each}

            </div>
        </Collapser>

    </div>
</main>


<style>
    .box {
        border-radius: 10px;
        box-shadow: 5px 5px 10px 2px lightgray;

        height: max-content;
        background-color: white;
        
        display: flex;
        flex-direction: column;
        padding: 1rem;
        gap: 10px;
        
        font-size: 0.75rem;
        text-align: left;
    }

    .hovered-thing {
        outline: solid 2px black;
    }

    h4 {
        margin: 0;

        overflow-wrap: break-word;
    }

    .related-things-list {
        background-color: whitesmoke;

        padding: 5px;
    }
  </style>