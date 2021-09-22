<script context="module" lang="ts">
    import type { Thing } from "./api/graph";
</script>
  
<script lang="ts">
    export let things: Thing[];
</script>


<main>
    {#each things as { text, note, a_relations, b_relations }}
        <div class="box">
            <h1>{text}</h1>
            {#each a_relations as { id, relationshipThingAId, relationshipThingBId }}
                <h3>{id} {relationshipThingAId} {relationshipThingBId}</h3>
            {/each}
            {#each b_relations as { id, relationshipThingAId, relationshipThingBId }}
                <h3>{id} {relationshipThingBId} {relationshipThingAId}</h3>
            {/each}
            {#if note}
                {@html note.text}
            {:else}
                <h2>NO NOTES YET</h2>
            {/if}
        </div>
    {/each}
</main>


<style>
    main {
        outline: solid 1px;
        flex-grow: 9;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
    }
    .box {
        padding: 1rem;
        margin: 1rem;
        box-shadow: 5px 5px 10px 2px lightgray;
    }
    .box:hover {
        box-shadow: 5px 5px 10px 10px lightgray;
    }
  </style>