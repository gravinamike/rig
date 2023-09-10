<script lang="ts">
    import type { SpaceDbModel } from "$lib/models/dbModels"
    import { Collapser } from "$lib/widgets/layoutWidgets"

    export let spaceDbModel: SpaceDbModel
</script>


<main>
    <div class="box">

        <h4>{`${spaceDbModel.id} ${spaceDbModel.text}`}</h4>

        Build method: {spaceDbModel.buildmethod}

        <Collapser headerText={"Directions"}>
            <div class="directions-list">
                {#each spaceDbModel.directions as { id, oppositeid, text, nameforobjects }}
                    <p>
                        Id: {id} Opposite: {oppositeid}<br>
                        Text: {text}<br>
                        Objects: {nameforobjects}<br>
                    </p>
                {/each}
            </div>
        </Collapser>

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

    .directions-list {
        background-color: whitesmoke;

        padding: 5px;
    }
  </style>