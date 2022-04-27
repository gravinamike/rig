<script lang="ts">
    import type { Graph } from "$lib/models/graphModels"
    import type { Thing } from "$lib/models/dbModels"
    import { thingsStore, storeGraphConstructs, retrieveGraphConstructs, graphConstructInStore } from "$lib/stores/graphStores"
    import { addFolderToThing } from "$lib/db/clientSide"

    export let graph: Graph


    let pThingIds: number[] | null = null
    $: pThingIds = graph.pThingIds
    $: pThingId = pThingIds && pThingIds.length ? pThingIds[0] : null
    $: pThing = pThingId && $thingsStore && graphConstructInStore("Thing", pThingId) ?
        retrieveGraphConstructs<Thing>("Thing", pThingId) :
        null

    $: path = pThing && pThing.folder ? pThing.folder.path : null
    $: folderGuid = path ?
        path.split("\\")[0] : // In the case of legacy paths which inlcude a filename, get only the folder.
        null

    let folderContents: string[] = []
    $: if (folderGuid) {
        fetch(`api/file/attachmentsFolder-${folderGuid}`)
        .then(response => {return (response.json() as unknown) as string[]})
        .then(data => folderContents = data)
    }

    async function addFolder() {///////////// This should only be called prior to opening or adding files to a Folder for a Thing that doesn't yet have a Folder.
        if (pThing && !pThing.folder) {
            await addFolderToThing(pThing.id)
            // Re-store the Thing (in order to update its linker to the new Folder).
            await storeGraphConstructs<Thing>("Thing", pThing.id, true)
        }
    }
</script>


<main>
    <h4>Attachments</h4>

    <div
        on:click={addFolder}
    >
        ADD FOLDER
    </div>

    {#if folderGuid === null}
        NO FOLDER YET
    {/if}

    <div class="items-container">
        {#each folderContents as item}
            <div class="folder-item">
                {item}
            </div>
        {/each}
    </div>
</main>


<style>
    main {
        outline: solid 1px lightgrey;
        outline-offset: -1px;

        box-sizing: border-box;
        width: 500px;
        height: 100%;
        background-color: #fafafa;

        display: flex;
        flex-direction: column;

        text-align: center;
    }

    .items-container {
        display: flex;
        flex-direction: column;
        padding: 1rem;
        gap: 0.25rem;

        font-size: 0.85rem;
    }

    .folder-item {
        border-radius: 3px;
        outline: solid 1px lightgrey;
        outline-offset: -1px;

        padding: 0.5rem;

        text-align: left;

        cursor: pointer;
    }

    .folder-item:hover {
        background-color: gainsboro;
    }

    .folder-item:active {
        background-color: lightgrey;
    }
</style>