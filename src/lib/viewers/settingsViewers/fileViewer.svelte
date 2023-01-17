<script lang="ts">
    import { graphFoldersStore, refreshGraphFoldersStore, enableNewFileCreation, openGraphStore } from "$lib/stores"
    import { openUnigraphFolder } from "$lib/shared/unigraph"


    /*let graphFolders: string[] = []

    function refreshGraphFolders() {
        fetch(`api/file/graphFolders`)
            .then(response => {return (response.json() as unknown) as string[]})
            .then(data => graphFolders = data)
    }*/
    refreshGraphFoldersStore()
</script>


<div class="file-viewer">
    <h4>Open file:</h4>

    <div class="graph-folder-buttons">
        {#each $graphFoldersStore as folder}
            <div
                class="button graph-folder-button { folder === $openGraphStore ? "opened" : "" }"
                on:click={() => {openUnigraphFolder(folder, true)}}
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
            New Graph
        </div>
    </div>
</div>


<style>
    .file-viewer {
        outline: solid 1px lightgrey;
        outline-offset: -1px;
        
        box-sizing: border-box;
        height: 100%;
        background-color: #fafafa;

        overflow-x: hidden;
        overflow-y: auto;

        display: flex;
        flex-direction: column;
        padding: 0.75rem;
        gap: 1.25rem;
        
        text-align: center;

        scrollbar-width: thin;
    }

    h4 {
        margin: 0;
    }

    .graph-folder-buttons {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;

        font-size: 0.85rem;
    }

    .button {
        border-radius: 3px;
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
  </style>