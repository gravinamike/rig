<script context="module" lang="ts">
    import type { Thing } from "./api/graph";
    import ThingWidget from "./thingWidget.svelte";
</script>
  
<script lang="ts">
    export let things: Thing[];
</script>


<main>
    <div class="centralAnchor">
        {#each things as thing}
            <ThingWidget
                {thing}
            />
        {/each}
    </div>
</main>


<style>
    main {
        flex-grow: 9;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        overflow: auto;
        outline: solid 1px;
    }
    .centralAnchor {
        position: relative;
        width: 0px;
        height: 0px;
    }
  </style>