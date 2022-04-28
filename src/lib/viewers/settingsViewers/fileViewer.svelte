<script lang="ts">
    import { openUnigraph, closeUnigraph } from "$lib/shared/unigraph"


    let graphFolders: string[] = []

    function refreshGraphFolders() {
        fetch(`api/file/graphFolders`)
            .then(response => {return (response.json() as unknown) as string[]})
            .then(data => graphFolders = data)
    }
    refreshGraphFolders()


    async function openUnigraphFolder(folderName: string) {
        await fetch("/api/file/unigraphFolder", {
            method: "POST",
            body: JSON.stringify(folderName)
        })

        await closeUnigraph()

        await openUnigraph()
    }
</script>


<main>
    <h4>File options</h4>

    Open Graph:

    <div class="graph-folders">
        {#each graphFolders as folder}
            <div
                class="graph-folder"
                on:click={() => {openUnigraphFolder(folder)}}
            >
                {folder}
            </div>
        {/each}
    </div>



</main>


<style>
    main {
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
    }

    h4 {
        margin: 0;
    }






    .graph-folders {
        display: flex;
        flex-direction: column;
        padding: 1rem;
        gap: 0.25rem;

        font-size: 0.85rem;
    }

    .graph-folder {
        border-radius: 3px;
        outline: solid 1px lightgrey;
        outline-offset: -1px;

        padding: 0.5rem;

        text-align: left;

        cursor: pointer;
    }

    .graph-folder:hover {
        background-color: gainsboro;
    }

    .graph-folder:active {
        background-color: lightgrey;
    }

  </style>