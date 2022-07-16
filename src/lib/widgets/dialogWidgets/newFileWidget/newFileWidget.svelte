<script lang="ts">
      import { newFileCreationStore, updateNewFileCreationFileName, disableNewFileCreation } from "$lib/stores"

    let newFileNameField: HTMLInputElement

    const validCharactersRegex = /^[a-z0-9]+$/i
    let invalidFilename = false
    function checkForError() {
        if (newFileNameField && newFileNameField.value !== "" && !validCharactersRegex.test(newFileNameField.value))  {
            invalidFilename = true
        } else {
            invalidFilename = false
        }
    }

    $: if (
        $newFileCreationStore.dialogOpen
        && !$newFileCreationStore.newFileName
        && newFileNameField
    ) {
        newFileNameField.focus()
    }

    function handleEscape(event: KeyboardEvent) {
        if (event.key === "Escape") {
            disableNewFileCreation()
        }
    }

    function handleEnter() {
        if (newFileNameField && newFileNameField.value !== "" && !invalidFilename) {
            updateNewFileCreationFileName(newFileNameField.value)
            console.log("CODE TO CREATE NEW FILE GOES HERE.")
            disableNewFileCreation()
        }
    }
</script>


{#if $newFileCreationStore.dialogOpen && !$newFileCreationStore.newFileName }
    <div
        class="disabled-background"
        style="position: absolute; left: 0px; top: 0px; width: 100%; height: 100%; z-index: 1; background-color: grey; opacity: 0.5;"
        on:click|stopPropagation={() => {
            disableNewFileCreation()
        }}
        on:wheel|preventDefault
    />

    <div
        class="new-file-creation-widget"
        on:click|stopPropagation
        on:keyup|stopPropagation={handleEscape}
    >
        <div class="inner-widget">
            <img src="./icons/new-file.png" alt="link" width=30px height=30px />
            <input
                type="text"
                placeholder="Enter name for new file..."
                bind:this={newFileNameField}
                on:keypress={ (event) => {
                    if (event.key === "Enter") handleEnter()
                } }
                on:input={checkForError}
            />
        </div>

        {#if invalidFilename}
            <div class="error-message">
                Filename can only contain alphanumeric characters, hyphens and underscores.
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
        z-index: 1;
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