<script lang="ts">
    // Import types.
    import type { Graph } from "$lib/models/constructModels"

    // Import SvelteKit framework resources.
    import { onMount } from "svelte"

    // Import stores.
    import {
        uIBackgroundColorStore, uITrimColorStore, uIHeaderColorStore, lightenOrDarkenColorString,
        userIdStore, graphFoldersStore, refreshGraphFoldersStore, openGraphStore, enableNewFileCreation
    } from "$lib/stores"
    
    // Import utility functions.
    import { onMobile } from "$lib/shared/utility"

    // Import file-handling functions.
    import { openGraphFile } from "$lib/shared/unigraph"



    export let currentlyOpenGraph: Graph | null


    
    // The Graph-folders-by-username array contains arrays of names of valid Graph folders, keyed
    // to the usernames that own them, with "all" (the set of Graph folders belonging to no user)
    // first.
    let graphFoldersByUsername: [string, string[]][] = []
    $: graphFoldersByUsername =
        Object.entries($graphFoldersStore).sort(
            (a, b) => (a[0] === "all" ? 1 : 0) - (b[0] === "all" ? 1 : 0)
        )

    // The string of format `<username>/<Graph-folder-name>` corresponding with the currently-
    // hovered list entry.
    let hoveredEntryUsernameAndFolder: string | null = null

    // The color to highlight the currently-hovered list entry.
    const highlightedColor = lightenOrDarkenColorString($uITrimColorStore, "lighter", 50)

    
    // When the menu is rendered, refresh the Graph-folders store.
    onMount(async () => {
        await refreshGraphFoldersStore($userIdStore)
    })
</script>


<!-- File viewer. -->
<div
    class="file-viewer"
    class:on-mobile={onMobile()}

    style="background-color: {$uITrimColorStore};"
>
    <!-- File viewer content. -->
    <div
        class="content"

        style="background-color: {$uIBackgroundColorStore};"
    >
        <!-- Blocks of Graph folders for each username. -->
        {#each graphFoldersByUsername as [username, folders]}
            <div class="user-block">
                <!-- User-block header. -->
                <div
                    class="username"

                    style="background-color: {$uIHeaderColorStore};"
                >
                    {username === "all" ? "Common Graphs": `${username}'s Graphs`}:
                </div>

                <!-- Buttons for that user's Graph folders. -->
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
                        on:click={() => {currentlyOpenGraph = null; openGraphFile(username, folder, null, true)}}
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

                <!-- Create-new Graph button. -->
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
        padding: 0.25rem 0rem 0.25rem 0rem;
        gap: 2rem;
        
        text-align: center;

        overflow-x: hidden;
        overflow-y: auto;
        scrollbar-width: thin;
    }

    .file-viewer.on-mobile .content {
        gap: 1rem;
    }

    .user-block {
        display: flex;
        flex-direction: column;
        padding: 0.5rem;
    }

    .username {
        margin-bottom: 0.5rem;

        display: flex;
        flex-direction: column;
        padding: 0.25rem 0.5rem 0.25rem 0.5rem;
        gap: 1rem;
        
        text-align: left;
        font-size: 0.85rem;
        font-weight: 600;
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
        
        font-size: 0.7rem;
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