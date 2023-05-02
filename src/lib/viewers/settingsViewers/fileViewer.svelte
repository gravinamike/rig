<script lang="ts">
    import { sessionSpecificFetch as fetch } from "$lib/db/sessionSpecificFetch"

    import { graphFoldersStore, refreshGraphFoldersStore, enableNewFileCreation, openGraphStore, uIBackgroundColorStore, uITrimColorStore } from "$lib/stores"
    import { openGraphFile } from "$lib/shared/unigraph"


    refreshGraphFoldersStore()
</script>


<div
    class="file-viewer"

    style="background-color: {$uITrimColorStore};"
>

    <div
        class="content"

        style="background-color: {$uIBackgroundColorStore};"
    >
        <h4>File</h4>

        <div class="graph-folder-buttons">
            {#each $graphFoldersStore as folder}
                <div
                    class="button graph-folder-button { folder === $openGraphStore ? "opened" : "" }"
                    on:click={() => {openGraphFile(folder, null, true)}}
                    on:keydown={()=>{}}
                >
                    {folder}
                </div>
            {/each}

            <div
                class="button new-graph-button"
                style={ $graphFoldersStore.length ? "margin-top: 25px;" : ""}
                on:click={enableNewFileCreation}
                on:keydown={()=>{}}
            >
                <strong>+</strong>&nbsp;&nbsp;&nbsp;New Graph
            </div>
        </div>
    </div>
    
</div>


<style>
    .file-viewer {        
        box-sizing: border-box;
        height: 100%;

        display: flex;
        flex-direction: column;
        padding: 0.5rem;
    }

    .content {
        border-radius: 5px;
        
        height: 100%;

        display: flex;
        flex-direction: column;
        padding: 0.5rem 1rem 0.5rem 1rem;
        gap: 2rem;
        
        text-align: center;
    }

    h4 {
        margin: 0;
    }

    .graph-folder-buttons {
        flex: 1 1 0;
        
        display: flex;
        flex-direction: column;
        gap: 0.25rem;

        font-size: 0.85rem;

        overflow-x: hidden;
        overflow-y: auto;
        scrollbar-width: thin;
    }

    .button {
        border-radius: 15px;
        outline: solid 1px lightgrey;
        outline-offset: -1px;

        padding: 0.5rem;

        cursor: pointer;
    }

    .button:hover {
        background-color: gainsboro;
    }

    .button:active {
        background-color: silver;
    }

    .graph-folder-button {
        text-align: left;
    }

    .graph-folder-button.opened {
        background-color: lightgrey;

        pointer-events: none;
    }

    .new-graph-button {
        color: grey;
        font-style: italic;
    }

    .new-graph-button:hover {
        color: black;
        font-style: normal;
    }

    .new-graph-button strong {
        font-size: 1rem;
    }
  </style>