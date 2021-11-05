<script lang="ts">
    import { directionsStoreAsArray, directionIdsNotFoundStore } from "$lib/shared/stores"
    import DirectionDetailsWidget from "$lib/components/graphWidgets/directionDetailsWidget.svelte"
</script>


<main>
    {#if $directionsStoreAsArray.length}
        <h2>{$directionsStoreAsArray.length} Directions found:</h2>
    {/if}

    {#each $directionsStoreAsArray as direction}
        <DirectionDetailsWidget
            {direction}
        />
    {/each}

    {#if $directionIdsNotFoundStore.length}
        <h2>{$directionIdsNotFoundStore.length} Directions not found:</h2>
    {/if}

    {#each $directionIdsNotFoundStore as id}
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