<script lang="ts">
    import type { Space } from "$lib/shared/graph/graphDb"
    import Collapser from "$lib/components/layoutElements/collapser.svelte"

    export let space: Space
</script>


<main>
    <div class="box">

        <h4>{`${space.id} ${space.text}`}</h4>

        <Collapser headerText={"Directions"}>
            <div class="directions-list">
                {#each space.directions as { id, oppositeid, text, nameforobjects }}
                    <p>
                        Id: {id} Opposite: {oppositeid}<br>
                        Text: {text}<br>
                        Objects: {nameforobjects}<br>
                    </p>
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

    .directions-list {
        padding: 5px;
        background-color: whitesmoke;
    }
  </style>