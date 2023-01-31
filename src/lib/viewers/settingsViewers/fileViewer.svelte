<script lang="ts">
    import { sessionSpecificFetch as fetch } from "$lib/db/utility/sessionSpecificFetch"

    import { graphFoldersStore, refreshGraphFoldersStore, enableNewFileCreation, openGraphStore } from "$lib/stores"
    import { openGraphFile } from "$lib/shared/unigraph"


    /*let graphFolders: string[] = []

    function refreshGraphFolders() {
        fetch(`api/file/graphFolders`)
            .then(response => {return (response.json() as unknown) as string[]})
            .then(data => graphFolders = data)
    }*/
    refreshGraphFoldersStore()
</script>


<div class="file-viewer">

    <div class="content">
        <h4>Open file:</h4>

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
        background-color: #E8E8E8;

        display: flex;
        flex-direction: column;
        padding: 0.5rem;
    }

    h4 {
        margin: 0;
    }

    .content {
        flex: 1 1 0;

        border-radius: 5px;
        
        background-color: white;

        overflow-x: hidden;
        overflow-y: auto;

        display: flex;
        flex-direction: column;
        padding: 0.5rem 1rem 0.5rem 1rem;
        gap: 2rem;
        
        text-align: center;

        scrollbar-width: thin;
    }

    .graph-folder-buttons {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;

        font-size: 0.85rem;
    }

    .button {
        border-radius: 10px;
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