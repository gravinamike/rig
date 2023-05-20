<script lang="ts">
    import { spaceDbModelsStoreAsArray, spaceIdsNotFoundStore } from "$lib/stores/graphConstructStores"
    import { SpaceDetailsWidget } from "$lib/widgets/detailsWidgets"
</script>


<div class="spaces-store-viewer">
    <!-- List of Spaces found. -->
    {#if $spaceDbModelsStoreAsArray.length}
        <h4>{$spaceDbModelsStoreAsArray.length} Spaces found:</h4>

        {#each $spaceDbModelsStoreAsArray as spaceDbModel}
            <SpaceDetailsWidget
                {spaceDbModel}
            />
        {/each}
    {/if}

    <!-- List of Spaces not found. -->
    {#if $spaceIdsNotFoundStore.length}
        <h4>{$spaceIdsNotFoundStore.length} Spaces not found:</h4>

        {#each $spaceIdsNotFoundStore as id}
            <div class="box">
                <h3>{id}</h3>
            </div>
        {/each}
    {/if}
</div>


<style>
    .spaces-store-viewer {
        border-radius: 0 0 5px 5px;

        box-sizing: border-box;
        height: 100%;
        background-color: #fafafa;

        overflow-x: hidden;
        overflow-y: auto;

        display: flex;
        flex-direction: column;
        padding: 0.75rem;
        gap: 0.75rem;
        
        text-align: center;

        scrollbar-width: thin;
    }

    h4 {
        margin: 0;
    }

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
  </style>