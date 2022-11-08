<script lang="ts">
    import { spaceDbModelsStoreAsArray } from "$lib/stores/graphConstructStores"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets";
    import SpaceWidget from "./spaceWidget.svelte"

    export let graphWidgetStyle: GraphWidgetStyle
</script>


<div class="spaces-viewer">
    <h4>Spaces</h4>

    {#each $spaceDbModelsStoreAsArray as model}
        <SpaceWidget
            {model}
            {graphWidgetStyle}
        />
    {/each}
</div>


<style>
    .spaces-viewer {
        outline: solid 1px lightgrey;
        outline-offset: -1px;

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
  </style>