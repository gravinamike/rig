<script lang="ts">
    import type { Space, Thing } from "../api/graph";
    import ThingWidget from "./thingWidget.svelte";

    export let things: Thing[];
    export let spacesStore: { [id: number]: Space };
</script>


<main>
    <div class="centralAnchor">
        {#each things as thing}
            <ThingWidget
                {thing}
                {spacesStore}
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