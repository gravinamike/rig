<script lang="ts">
    import { spacesStoreAsArray, spaceIdsNotFoundStore } from '$lib/shared/stores'
</script>


<main>
    {#if $spacesStoreAsArray.length}
        <h2>Spaces found:</h2>
    {/if}
    {#each $spacesStoreAsArray as { id, text, directions }}
        <div class="box">
            <h3>{id}: {text}</h3>
            <strong>DIRECTIONS:</strong>
            {#each directions as { id, oppositeid, text, nameforobjects }}
                <p>ID: {id} OPP: {oppositeid}</p>
                <p>TEXT: {text} OBJ: {nameforobjects}</p>
            {/each}
        </div>
    {/each}

    {#if $spaceIdsNotFoundStore.length}
        <h2>Spaces not found:</h2>
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
        display: flex;
        flex-direction: column;
        overflow-x: hidden;
        overflow-y: auto;
        outline: solid 1px;
        text-align: center;
    }
    .box {
        padding: 1rem;
        margin: 1rem;
        height: max-content;
        font-size: 0.75rem;
        text-align: center;
        border-radius: 10px;
        box-shadow: 5px 5px 10px 2px lightgray;
    }
  </style>