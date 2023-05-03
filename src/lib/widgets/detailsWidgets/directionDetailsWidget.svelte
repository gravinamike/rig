<script lang="ts">
    import type { DirectionDbModel } from "$lib/models/dbModels"

    export let directionDbModel: DirectionDbModel
</script>


<main>
    <div class="box">
        <h4>Id: {`${directionDbModel.id}`} Opp: {`${directionDbModel.oppositeid}`}</h4>
        <h4>Text: {`${directionDbModel.text}`}</h4>
        <h4>Objects: {`${directionDbModel.nameforobjects}`}</h4>
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