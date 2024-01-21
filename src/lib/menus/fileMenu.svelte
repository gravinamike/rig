<script lang="ts">
    import { onMount } from "svelte"
    import { graphFoldersStore, refreshGraphFoldersStore, enableNewFileCreation, openGraphStore, uIBackgroundColorStore, uITrimColorStore, userIdStore, uIHeaderColorStore, lightenOrDarkenColorString } from "$lib/stores"
    import { openGraphFile } from "$lib/shared/unigraph"
    import { onMobile } from "$lib/shared/utility"
    import type { Graph } from "$lib/models/constructModels"



    export let graph: Graph | null


    
    let graphFoldersByUsername: [string, string[]][] = []
    $: graphFoldersByUsername =
        Object.entries($graphFoldersStore).sort(
            (a, b) => (a[0] === "all" ? 1 : 0) - (b[0] === "all" ? 1 : 0)
        )

    const highlightedColor = lightenOrDarkenColorString($uITrimColorStore, "lighter", 50)
    let hoveredEntryUsernameAndFolder: string | null = null


    onMount(async () => {
        await refreshGraphFoldersStore($userIdStore)
    })
</script>


<div
    class="file-viewer"
    class:on-mobile={onMobile()}

    style="background-color: {$uITrimColorStore};"
>

    <div
        class="content"

        style="background-color: {$uIBackgroundColorStore};"
    >
        <div class="graph-folder-buttons">
            {#each graphFoldersByUsername as [username, folders]}
                <div class="user-block">
                    <div
                        class="username"

                        style="background-color: {$uIHeaderColorStore};"
                    >
                        {username === "all" ? "Common Graphs": `${username}'s Graphs:`}:
                    </div>
    
                    {#each folders as folder}
                        <div
                            class="button graph-folder-button {
                                `${username}/${folder}` === $openGraphStore ? "opened" : ""
                            }"

                            style= {
                                `${username}/${folder}` === hoveredEntryUsernameAndFolder ?
                                    `background-color: ${highlightedColor};` :
                                    ""
                            }

                            on:mouseenter={() => {hoveredEntryUsernameAndFolder = `${username}/${folder}`}}
                            on:mouseleave={() => {hoveredEntryUsernameAndFolder = null }}
                            on:click={() => {graph = null; openGraphFile(username, folder, null, true)}}
                            on:keydown={()=>{}}
                        >
                            <img
                                src="./icons/rig.png"
                                alt="Rig file icon"
                                width=16px
                                height=16px
                            >
                            {folder}
                        </div>
                    {/each}
    
                    <div
                        class="button new-graph-button"

                        style="
                            {
                                `${username}//new-graph` === hoveredEntryUsernameAndFolder ?
                                    `background-color: ${highlightedColor};` :
                                    ""
                            }
                        "

                        on:mouseenter={() => {hoveredEntryUsernameAndFolder = `${username}//new-graph`}}
                        on:mouseleave={() => {hoveredEntryUsernameAndFolder = null }}
                        on:click={() => enableNewFileCreation(username)}
                        on:keydown={()=>{}}
                    >
                        <strong>+</strong>&nbsp;New Graph
                    </div>
                </div>
            {/each}
        </div>
    </div>
    
</div>


<style>
    .file-viewer {        
        box-sizing: border-box;
        height: 100%;

        display: flex;
        flex-direction: column;
    }

    .content {
        border-radius: 0 0 5px 5px;
        
        height: 100%;

        display: flex;
        flex-direction: column;
        padding: 1rem 0rem 0.25rem 0rem;
        gap: 2rem;
        
        text-align: center;
    }

    .file-viewer.on-mobile .content {
        padding: 0.25rem 0.5rem 0.25rem 0.5rem;
        gap: 1rem;
    }

    .user-block {
        display: flex;
        flex-direction: column;
        padding: 0.25rem;
    }

    .username {
        margin-bottom: 0.5rem;

        padding: 0.25rem 0.5rem 0.25rem 0.5rem;

        text-align: left;
        font-weight: 600;
    }

    .graph-folder-buttons {
        flex: 1 1 0;
        
        display: flex;
        flex-direction: column;
        gap: 1rem;

        font-size: 0.85rem;

        overflow-x: hidden;
        overflow-y: auto;
        scrollbar-width: thin;
    }

    .file-viewer.on-mobile .graph-folder-buttons {
        font-size: 0.7rem;
    }

    .button {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        padding: 0.5rem;
        gap: 0.4rem;

        cursor: pointer;
    }

    .file-viewer.on-mobile .button {
        padding: 0.25rem 0.25rem 0.25rem 0.5rem;
    }

    .graph-folder-button {
        text-align: left;
    }

    .graph-folder-button.opened {
        border-radius: 3px;
        box-shadow: 1px 1px 2px 1px silver;

        z-index: 1;

        pointer-events: none;
    }

    .new-graph-button {
        padding: 0.5rem 0.5rem 0.5rem 11px;

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

    .file-viewer.on-mobile .new-graph-button strong {
        font-size: 0.7rem;
    }
  </style>