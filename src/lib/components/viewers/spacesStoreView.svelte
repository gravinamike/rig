<script lang="ts">
    import { spacesStoreAsArray, spaceIdsNotFoundStore } from "$lib/shared/stores"
    import SpaceDetailsWidget from "$lib/components/graphWidgets/spaceDetailsWidget.svelte"
</script>


<main>
    {#if $spacesStoreAsArray.length}
        <h2>{$spacesStoreAsArray.length} Spaces found:</h2>
    {/if}

    {#each $spacesStoreAsArray as space}
        <SpaceDetailsWidget
            {space}
        />
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
  </style>