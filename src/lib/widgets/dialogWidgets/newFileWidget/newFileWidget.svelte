<script lang="ts">
    import { sessionSpecificFetch as fetch } from "$lib/db/sessionSpecificFetch"

    import { refreshGraphFoldersStore, newGraphFileCreationStore, updateNewFileCreationFileName, disableNewFileCreation, userIdStore } from "$lib/stores"
    import { createGraph } from "$lib/db/makeChanges"
    import { openGraphFile } from "$lib/shared/unigraph"
    import { filenameIsValid } from "$lib/shared/utility";


    let newFileNameField: HTMLInputElement
    




    const currentGraphFoldersByUsername: {[username: string]: string[]} = {}
    async function refreshCurrentGraphFolders() {
        await fetch(`api/file/graphFolders-all`)
            .then(response => {return (response.json() as unknown) as string[]})
            .then(data => currentGraphFoldersByUsername["all"] = data)
            
        if ($userIdStore) await fetch(`api/file/graphFolders-${$userIdStore}`)
            .then(response => {return (response.json() as unknown) as string[]})
            .then(data => currentGraphFoldersByUsername[$userIdStore as string] = data)
    }

    const validCharactersRegex = /^[-_a-z0-9]+$/i
    let invalidFilename = false
    async function checkForError() {
        if (
            newFileNameField
            && (
                !filenameIsValid(newFileNameField.value)
                || (
                    !$newGraphFileCreationStore.username
                    && currentGraphFoldersByUsername["all"].includes(newFileNameField.value)
                )
                || (
                    $newGraphFileCreationStore.username
                    && $newGraphFileCreationStore.username in currentGraphFoldersByUsername
                    && currentGraphFoldersByUsername[$newGraphFileCreationStore.username].includes(newFileNameField.value)
                )
            )
        )  {
            invalidFilename = true
        } else {
            invalidFilename = false
        }
    }

    $: if (
        $newGraphFileCreationStore.dialogOpen
        && !$newGraphFileCreationStore.newFileName
        && newFileNameField
    ) {
        newFileNameField.focus()
    }

    function handleEscape(event: KeyboardEvent) {
        if (event.key === "Escape") {
            disableNewFileCreation()
        }
    }

    async function handleEnter() {
        if (newFileNameField && newFileNameField.value !== "" && !invalidFilename) {
            const newFileName = newFileNameField.value
            updateNewFileCreationFileName(newFileName)
            const graphCreated = await createGraph(newFileName)
            if (graphCreated) {
                openGraphFile($newGraphFileCreationStore.username || "all", newFileName)
            }
            disableNewFileCreation()
            refreshGraphFoldersStore()
        }
    }
</script>


{#if $newGraphFileCreationStore.dialogOpen && !$newGraphFileCreationStore.newFileName }
    <div
        class="disabled-background"
        style="position: absolute; left: 0px; top: 0px; width: 100%; height: 100%; z-index: 1; background-color: grey; opacity: 0.5;"
        on:click|stopPropagation={() => {
            disableNewFileCreation()
        }}
        on:wheel|preventDefault
        on:keydown={()=>{}}
    />

    <div
        class="new-file-creation-widget"
        on:click|stopPropagation
        on:keyup|stopPropagation={handleEscape}
    >
        <div class="inner-widget">
            <img src="./icons/new-file.png" alt="New file" width=30px height=30px />
            <input
                type="text"
                placeholder="Enter name for new file..."
                bind:this={newFileNameField}
                on:keypress={ (event) => {
                    if (event.key === "Enter") handleEnter()
                } }
                on:input={async () => {
                    await refreshCurrentGraphFolders()
                    checkForError()
                } }
            />
        </div>

        {#if invalidFilename}
            <div class="error-message">
                Filename contains invalid characters or duplicates an existing filename.
            </div>
        {/if}
    </div>
{/if}


<style>
    .new-file-creation-widget {
        border-radius: 10px;
        outline: solid 1px grey;
        outline-offset: -1px;
        box-shadow: 0 0 20px 10px whitesmoke;

        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        z-index: 2;
        box-sizing: border-box;
        background-color: #fafafa;

        display: flex;
        flex-direction: column;
        padding: 10px;
        gap: 10px;
    }

    .inner-widget {
        display: flex;
        flex-direction: row;
        gap: 10px;
    }

    input {
        border-radius: 6px;
        border: solid 1px grey;
        outline-offset: -1px;

        box-sizing: border-box;
        width: 500px;

        padding: 0.25rem 0.3rem 0.35rem 0.3rem;
    }

    input:focus {
        outline: solid 2px black;
    }

    .error-message {
        color: red;
        text-align: center;
    }
</style>