<script lang="ts">
    import type { Thing } from "../api/graph";
    
    export let things: Thing[];
</script>


<main>
    {#each things as { id, text, defaultplane, a_relations, b_relations }}
        <div class="box">
            <h3>{id}: {text}</h3>
            <h3>SPACE: {defaultplane}</h3>
            <strong>A-RELATIONS:</strong>
            {#each a_relations as { id, relationshipDirection, relationshipThingAId, relationshipThingBId }}
                <p>ID: {id} DIR: {relationshipDirection}</p>
                <p>IDA: {relationshipThingAId} IDB: {relationshipThingBId}</p>
            {/each}
            <strong>B-RELATIONS:</strong>
            {#each b_relations as { id, relationshipDirection, relationshipThingAId, relationshipThingBId }}
                <p>ID: {id} DIR: {relationshipDirection}</p>
                <p>IDB: {relationshipThingBId} IDA: {relationshipThingAId}</p>
            {/each}
        </div>
    {/each}
</main>


<style>
    main {
        width: 225px;
        display: flex;
        display: flex;
        flex-direction: column;
        overflow-x: hidden;
        overflow-y: auto;
        outline: solid 1px;
    }
    .box {
        padding: 1rem;
        margin: 1rem;
        height: max-content;
        font-size: 0.75rem;
        text-align: center;
        border-radius: 10px;
        box-shadow: 5px 5px 10px 2px lightgray;
    }
  </style>