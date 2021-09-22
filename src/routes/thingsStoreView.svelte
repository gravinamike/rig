<script context="module" lang="ts">
    import type { Thing } from "./api/graph";
</script>
  
<script lang="ts">
    export let things: Thing[];
</script>


<main>
    {#each things as { id, text, a_relations, b_relations }}
        <div class="box">
            <h3>ID: {id}</h3>
            <h3>TEXT: {text}</h3>
            <strong>A-RELATIONS:</strong>
            {#each a_relations as { id, relationshipThingAId, relationshipThingBId }}
                <p>ID: {id} THING A: {relationshipThingAId} THING B: {relationshipThingBId}</p>
            {/each}
            <strong>B-RELATIONS:</strong>
            {#each b_relations as { id, relationshipThingAId, relationshipThingBId }}
                <p>ID: {id} THING B: {relationshipThingBId} THING A: {relationshipThingAId}</p>
            {/each}
        </div>
    {/each}
</main>


<style>
    main {
        outline: solid 1px;
        flex-grow: 1;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
    }
    .box {
        padding: 1rem;
        margin: 1rem;
        height: max-content;
        box-shadow: 5px 5px 10px 2px lightgray;
        text-align: center;
    }
  </style>