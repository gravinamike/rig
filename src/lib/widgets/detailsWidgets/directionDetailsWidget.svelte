<script lang="ts">
    import type { Direction } from "$lib/models/dbModels"

    export let direction: Direction
</script>


<main>
    <div class="box">
        <h4>Id: {`${direction.id}`} Opp: {`${direction.oppositeid}`}</h4>
        <h4>Text: {`${direction.text}`}</h4>
        <h4>Objects: {`${direction.nameforobjects}`}</h4>
    </div>
</main>


<style>
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

    h4 {
        margin: 0;

        overflow-wrap: break-word;
    }
  </style>