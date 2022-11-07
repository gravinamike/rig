<script lang="ts">
    import { directionDbModelsStoreAsArray } from "$lib/stores"
    import DirectionWidget from "./directionWidget.svelte"
</script>


<div class="directions-viewer">
    <h4>Directions</h4>

    {#each $directionDbModelsStoreAsArray as model}
        <DirectionWidget
            {model}
        />    
    {/each}
</div>


<style>
    .directions-viewer {
        outline: solid 1px lightgrey;
        outline-offset: -1px;

        box-sizing: border-box;
        height: 100%;
        background-color: #fafafa;

        overflow-x: hidden;
        overflow-y: auto;

        display: flex;
        flex-direction: column;
        padding: 0.5rem;
        gap: 1rem;
        
        text-align: center;

        scrollbar-width: thin;
    }

    h4 {
        margin: 0;
    }
  </style>