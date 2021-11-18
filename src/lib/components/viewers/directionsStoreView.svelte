<script lang="ts">
    import { directionsStoreAsArray, directionIdsNotFoundStore } from "$lib/shared/stores/graphStores"
    import DirectionDetailsWidget from "$lib/components/graphWidgets/directionDetailsWidget.svelte"
</script>


<main>
    {#if $directionsStoreAsArray.length}
        <h4>{$directionsStoreAsArray.length} Directions found:</h4>
    {/if}

    {#each $directionsStoreAsArray as direction}
        <DirectionDetailsWidget
            {direction}
        />
    {/each}

    {#if $directionIdsNotFoundStore.length}
        <h4>{$directionIdsNotFoundStore.length} Directions not found:</h4>
    {/if}

    {#each $directionIdsNotFoundStore as id}
        <div class="box">
            <h3>{id}</h3>
        </div>
    {/each}
</main>


<style>
    main {
        outline: solid 1px lightgrey;
        outline-offset: -1px;

        box-sizing: border-box;
        width: 225px;
        height: 100%;
        background-color: #fafafa;

        overflow-x: hidden;
        overflow-y: auto;

        display: flex;
        flex-direction: column;
        padding: 0.75rem;
        gap: 0.75rem;
        
        text-align: center;
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