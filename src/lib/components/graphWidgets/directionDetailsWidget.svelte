<script lang="ts">
    import type { Direction } from "$lib/shared/graph/graphDb"

    export let direction: Direction
</script>


<main>
    <div class="box">
        <h4>Id: {`${direction.id}`} Opp: {`${direction.oppositeid}`}</h4>
        <h4>Text: {`${direction.text}`} Objects: {`${direction.nameforobjects}`}</h4>
    </div>
</main>


<style>
    .box {
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin: 0.75rem;
        height: max-content;
        font-size: 0.75rem;
        text-align: left;
        background-color: white;
        border-radius: 10px;
        box-shadow: 5px 5px 10px 2px lightgray;
    }

    h4 {
        margin: 0;
        overflow-wrap: break-word;
    }

    .directions-list {
        padding: 5px;
        background-color: whitesmoke;
    }
  </style>