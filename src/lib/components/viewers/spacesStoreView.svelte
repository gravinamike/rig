<script lang="ts">
    import { spacesStoreAsArray, spaceIdsNotFoundStore } from "$lib/shared/stores"
    import Collapser from "$lib/components/layoutElements/collapser.svelte"
</script>


<main>
    {#if $spacesStoreAsArray.length}
        <h2>{$spacesStoreAsArray.length} Spaces found:</h2>
    {/if}

    {#each $spacesStoreAsArray as { id, text, directions }}
        <div class="box">
            <h4>{`${id} ${text}`}</h4>
            <Collapser headerText={"Directions"}>
                <div class="directions-list">
                    {#each directions as { id, oppositeid, text, nameforobjects }}
                        <p>
                            Id: {id} Opposite: {oppositeid}<br>
                            Text: {text}<br>
                            Objects: {nameforobjects}<br>
                        </p>
                    {/each}
                </div>
            </Collapser>
        </div>
    {/each}

    {#if $spaceIdsNotFoundStore.length}
        <h2>{$spaceIdsNotFoundStore.length} Spaces not found:</h2>
    {/if}

    {#each $spaceIdsNotFoundStore as id}
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

    .directions-list {
        padding: 5px;
        background-color: whitesmoke;
    }
  </style>