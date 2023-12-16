<script lang="ts">
    // Import types.
    import type { Thing } from "$lib/models/constructModels"
    import type { SearchOption } from "$lib/widgets/navWidgets/searchWidget"

    // Import utility functions.
    import { onMobile, sleep } from "$lib/shared/utility"

    // Import stores.
    import {
        thingLinkingStore, updateThingLinkingUrl, disableThingLinking, getGraphConstructs
    } from "$lib/stores"

    // Import related widgets.
    import { RemoteSelectingWidget } from "$lib/widgets/dialogWidgets"



    // Starting search text (what is entered in the search bar by default, if anything).
    let startingSearchText: string | null = null

    // If the Notes editor exists, set the starting search text to its current selection.
    $: if ($thingLinkingStore.editor) {
        const editor = $thingLinkingStore.editor
        const { from, to } = editor.state.selection
        const selectedTextInEditor = editor.state.doc.textBetween(from, to)
        startingSearchText = selectedTextInEditor
    }


    /**
     * Handle-escape method.
     * 
     * When escape is pressed, cancel Thing-linking.
     * @param event - The keyboard event that triggered this method.
     */
    function handleEscape(event: KeyboardEvent) {
        if (event.key === "Escape") cancel()
    }

    /**
     * Cancel method.
     * 
     * Cancels the current Thing-linking operation.
     */
    async function cancel() {
        // Allow the click that triggered the cancellation to finish.
        await sleep(50)

        // Put focus back on the Notes editor again.
        if ($thingLinkingStore.focusEditorMethod) $thingLinkingStore.focusEditorMethod()

        // Cancel Thing-linking.
        disableThingLinking()
    }

    /**
     * Submit method.
     * 
     * Adds 
     * @param selectedItem
     * @param matchedItems
     */
    async function submitMethod(selectedItem: SearchOption | null, matchedItems: SearchOption[]) {
        // Get the ID of the Thing to be linked to.
        const destThingId = (
            selectedItem ? selectedItem.id :
            matchedItems.length ? matchedItems[0].id :
            null
        )

        // Allow the click that triggered the submission to finish.
        await sleep(50) 

        // If the Thing ID to be linked to exists,
        if (destThingId) {
            // Get the corresponding Thing.
            const destThing = getGraphConstructs("Thing", destThingId) as Thing

            // Set the link to that Thing.
            if (destThing) {
                const url = `graph://${destThing.guid}`
                updateThingLinkingUrl(url)
                $thingLinkingStore.editor?.chain().focus().setLink({ href: url, target: '_blank' }).run()
            }            
        }
        
        // Exit the Thing-linking operation.
        cancel()
    }
</script>


<!-- Set up escape-key handling on the page body. -->
<svelte:body
    on:keyup|stopPropagation={handleEscape}
/>


{#if $thingLinkingStore.editor && !$thingLinkingStore.url}
    <!-- Darkened and click-disabled background "screen". -->
    <div
        class="disabled-background"

        on:click|stopPropagation={cancel}
        on:wheel|preventDefault
        on:keyup|stopPropagation={handleEscape}
    />

    <!-- Thing-linking widget. -->
    <div
        class="thing-linking-widget"

        style={
            onMobile() ? "width: calc(100% - 100px); height: calc(100% - 100px); padding: 15px;" :
            "width: calc(100% - 200px); height: calc(100% - 200px); padding: 20px;"
        }

        on:click|stopPropagation
        on:keyup|stopPropagation={handleEscape}
    >
        <RemoteSelectingWidget
            {startingSearchText}
            {submitMethod}
        /> 
    </div>
{/if}


<style>
    .disabled-background {
        position: absolute;
        left: 0px;
        top: 0px;
        width: 100%;
        height: 100%;
        z-index: 5;
        background-color: grey;
        opacity: 0.5;
    }

    .thing-linking-widget {
        border-radius: 20px;
        outline: solid 1px grey;
        outline-offset: -1px;
        box-shadow: 0 0 20px 10px whitesmoke;

        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        z-index: 5;
        box-sizing: border-box;
        background-color: #fafafa;

        display: flex;
        flex-direction: row;
    }
</style>