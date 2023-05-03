<script lang="ts">
    import type { Thing, Graph } from "$lib/models/constructModels"

    import { sessionSpecificFetch as fetch } from "$lib/db/sessionSpecificFetch"

    import { thingDbModelsStore, storeGraphDbModels, getGraphConstructs, graphDbModelInStore } from "$lib/stores/graphConstructStores"
    import { addFolderToThing } from "$lib/db"
    import type { ThingDbModel } from "$lib/models/dbModels"

    export let graph: Graph


    let pThingIds: number[] | null = null
    $: pThingIds = graph.pThingIds
    $: pThingId = pThingIds && pThingIds.length ? pThingIds[0] : null
    $: pThing = pThingId && $thingDbModelsStore && graphDbModelInStore("Thing", pThingId) ?
        getGraphConstructs<Thing>("Thing", pThingId) :
        null

    $: path = pThing && pThing.folder ? pThing.folder.path : null
    $: folderGuid = path ?
        path.split("\\")[0] : // In the case of legacy paths which inlcude a filename, get only the folder.
        null

    let folderPath = ""
    let folderContents: string[] = []
    $: if (folderGuid) {
        fetch(`api/file/attachmentsFolder-${folderGuid}`)
        .then(response => {
            return (response.json() as unknown) as {
                folderPath: string,
                folderContents: string[]
            }
        })
        .then(data => {
            folderPath = data.folderPath
            folderContents = data.folderContents
        })
    }

    async function addFolder() {///////////// This should only be called prior to opening or adding files to a Folder for a Thing that doesn't yet have a Folder.
        if (pThing && pThing.id && !pThing.folder) {
            await addFolderToThing(pThing.id)
            // Re-store the Thing (in order to update its linker to the new Folder).
            await storeGraphDbModels<ThingDbModel>("Thing", pThing.id, true)
        }
    }
</script>


<div class="folder-viewer">
    <h4>Attachments</h4>

    {#if folderGuid === null}
        <div
            on:click={addFolder}
            on:keydown={()=>{}}
        >
            ADD FOLDER
        </div>
    {:else}
        {folderPath}
    {/if}

    <div class="items-container">
        {#each folderContents as item}
            <div class="folder-item">
                {item}
            </div>
        {/each}
    </div>
</div>


<style>
    .folder-viewer {
        outline: solid 1px lightgrey;
        outline-offset: -1px;

        box-sizing: border-box;
        width: 100%;
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