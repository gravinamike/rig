<script lang="ts">
    import type { Thing } from "$lib/shared/graph/graphDb"
    import Collapser from "$lib/components/layoutElements/collapser.svelte"

    export let thing: Thing
</script>


<main>
    <div class="box">

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
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin: 0.75rem;
        height: max-content;
        font-size: 0.75rem;
        text-align: left;
        background-color: white;
        border-radius: 10px;
        box-shadow: 5px 5px 10px 2px lightgray;
    }

    h4 {
        margin: 0;
        overflow-wrap: break-word;
    }

    .related-things-list {
        padding: 5px;
        background-color: whitesmoke;
    }
  </style>