<script lang="ts">
    import type { LatestGraphConstructInfos } from "$lib/server/db/getInfo"

    import { onMount } from "svelte"
    import { getLatestGraphConstructInfos } from "$lib/db"


    let latestConstructs: LatestGraphConstructInfos | false = false

    onMount(async () => {
        latestConstructs = await getLatestGraphConstructInfos()
	})
</script>


<div class="db-latest-viewer">
    
    <h4>Latest constructs</h4>

    {#if latestConstructs}
        <div class="construct-container">
            <h4>Directions:</h4>
            <br>
            {#each latestConstructs.directions as info}
                <strong>ID</strong> {info.id}&nbsp;&nbsp;
                <strong>OPP. ID</strong> {info.oppositeid}&nbsp;&nbsp;
                <strong>TEXT</strong> {info.text}&nbsp;&nbsp;
                <strong>OBJ.</strong> {info.nameforobjects}&nbsp;&nbsp;
                <br>
            {/each}
            <br>

            <h4>Spaces:</h4>
            <br>
            {#each latestConstructs.spaces as info}
                <strong>ID</strong> {info.id}&nbsp;&nbsp;
                <strong>TEXT</strong> {info.text}&nbsp;&nbsp;
                <br>
            {/each}
            <br>

            <h4>DirectionToSpace:</h4>
            <br>
            {#each latestConstructs.directionToSpaces as info}
                <strong>ID</strong> {info.id}&nbsp;&nbsp;
                <strong>DIR ID</strong> {info.directionid}&nbsp;&nbsp;
                <strong>SPACE ID</strong> {info.spaceid}&nbsp;&nbsp;
                <strong>HALF AXIS ID</strong> {info.halfaxisid}&nbsp;&nbsp;
                <br>
            {/each}
            <br>


            <h4>Things:</h4>
            <br>
            {#each latestConstructs.things as info}
                <strong>ID</strong> {info.id}&nbsp;&nbsp;
                <strong>TEXT</strong> {info.text}&nbsp;&nbsp;
                <br>
            {/each}
            <br>

            <h4>Relationships:</h4>
            <br>
            {#each latestConstructs.relationships as info}
                <strong>ID</strong> {info.id}&nbsp;&nbsp;
                <strong>THING A ID</strong> {info.thingaid}&nbsp;&nbsp;
                <strong>THING B ID</strong> {info.thingbid}&nbsp;&nbsp;
                <br>
            {/each}
            <br>

            <h4>Notes:</h4>
            <br>
            {#each latestConstructs.notes as info}
                <strong>ID</strong> {info.id}&nbsp;&nbsp;
                <br>
            {/each}
            <br>

            <h4>NoteToThing:</h4>
            <br>
            {#each latestConstructs.noteToThings as info}
                <strong>ID</strong> {info.id}&nbsp;&nbsp;
                <strong>NOTE ID</strong> {info.noteid}&nbsp;&nbsp;
                <strong>THING ID</strong> {info.thingid}&nbsp;&nbsp;
                <br>
            {/each}
            <br>

            <h4>Folders:</h4>
            <br>
            {#each latestConstructs.folders as info}
                <strong>ID</strong> {info.id}&nbsp;&nbsp;
                <br>
            {/each}
            <br>

            <h4>FolderToThing:</h4>
            <br>
            {#each latestConstructs.folderToThings as info}
                <strong>ID</strong> {info.id}&nbsp;&nbsp;
                <strong>FOLDER ID</strong> {info.folderid}&nbsp;&nbsp;
                <strong>THING ID</strong> {info.thingid}&nbsp;&nbsp;
                <br>
            {/each}
            <br>
        </div>
    {/if}

</div>


<style>
    .db-latest-viewer {
        border-radius: 0 0 5px 5px;

        box-sizing: border-box;
        height: 100%;
        background-color: #fafafa;

        overflow-x: auto;
        overflow-y: auto;

        display: flex;
        flex-direction: column;
        padding: 0.75rem;
        gap: 0.75rem;

        text-align: center;

        scrollbar-width: thin;
    }

    h4 {
        margin: 0;
        text-align: center;
    }

    .construct-container {
        text-align: left;
        font-size: 0.65rem;
        white-space: nowrap;
    }
</style>