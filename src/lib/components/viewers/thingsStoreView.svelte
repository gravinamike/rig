<script lang="ts">
    import { thingsStoreAsArray, thingIdsNotFoundStore } from '$lib/shared/stores';
</script>


<main>
    {#if $thingsStoreAsArray.length}
        <h2>Things found:</h2>
    {/if}
    {#each $thingsStoreAsArray as { id, text, defaultplane, a_relationships, b_relationships }}
        <div class="box">
            <h3>{id}: {text}</h3>
            <h3>SPACE: {defaultplane}</h3>
            <strong>A-RELATIONS:</strong>
            {#each a_relationships as { id, direction, thingaid, thingbid }}
                <p>ID: {id} DIR: {direction}</p>
                <p>IDA: {thingaid} IDB: {thingbid}</p>
            {/each}
            <strong>B-RELATIONS:</strong>
            {#each b_relationships as { id, direction, thingaid, thingbid }}
                <p>ID: {id} DIR: {direction}</p>
                <p>IDA: {thingaid} IDB: {thingbid}</p>
            {/each}
        </div>
    {/each}

    {#if $thingIdsNotFoundStore.length}
        <h2>Things not found:</h2>
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
        display: flex;
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