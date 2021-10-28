<script lang="ts">
    import { thingsStoreAsArray, thingIdsNotFoundStore } from "$lib/shared/stores"
    import Collapser from "$lib/components/layoutElements/collapser.svelte"
</script>


<main>
    {#if $thingsStoreAsArray.length}
        <h2>{$thingsStoreAsArray.length} Things found:</h2>
    {/if}

    {#each $thingsStoreAsArray as { id, text, defaultplane, a_relationships, b_relationships }}
        <div class="box">
            <h4>{`${id} ${text}`}</h4>
            <h4>Space: {defaultplane}</h4>
            <Collapser headerText={"Related Things"}>
                <div class="related-things-list">
                    <strong>A-relations:</strong>
                    {#each a_relationships as { id, direction, thingaid, thingbid }}
                        <p>Id: {id} Dir: {direction}</p>
                        <p>Id A: {thingaid} Id B: {thingbid}</p>
                    {/each}
                    <strong>B-relations:</strong>
                    {#each b_relationships as { id, direction, thingaid, thingbid }}
                        <p>Id: {id} Dir: {direction}</p>
                        <p>Id A: {thingaid} Id B: {thingbid}</p>
                    {/each}
                </div>
            </Collapser>
        </div>
    {/each}

    {#if $thingIdsNotFoundStore.length}
        <h2>{$thingsStoreAsArray.length} Things not found:</h2>
    {/if}
    
    {#each $thingIdsNotFoundStore as id}
        <div class="box">
            <h3>{id}</h3>
        </div>
    {/each}
</main>


<style>
    main {
        width: 225px;
        height: 100%;
        display: flex;
        display: flex;
        flex-direction: column;
        overflow-x: hidden;
        overflow-y: auto;
        text-align: center;
        background-color: #fafafa;
        outline: solid 1px lightgrey;
        outline-offset: -1px;
    }
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