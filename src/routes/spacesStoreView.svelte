<script lang="ts">
    import type { Space } from "./api/graph";
    export let spaces: Space[];
</script>


<main>
    {#each spaces as { id, text, directions }}
        <div class="box">
            <h3>{id}: {text}</h3>
            <strong>DIRECTIONS:</strong>
            {#each directions as { id, oppositeid, text, nameforobjects }}
                <p>ID: {id} OPP: {oppositeid}</p>
                <p>TEXT: {text} OBJ: {nameforobjects}</p>
            {/each}
        </div>
    {/each}
</main>


<style>
    main {
        width: 225px;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        overflow-x: hidden;
        overflow-y: auto;
        outline: solid 1px;
    }
    .box {
        padding: 1rem;
        margin: 1rem;
        height: max-content;
        font-size: 0.75rem;
        font-weight: 400;
        text-align: center;
        border-radius: 10px;
        box-shadow: 5px 5px 10px 2px lightgray;
    }
  </style>