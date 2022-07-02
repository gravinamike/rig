<script lang="ts">
    import type { Graph } from "$lib/models/graphModels"
    import type { SearchOption } from "$lib/widgets/navWidgets/searchWidget"
    import {
        thingLinkingStore, updateThingLinkingUrl, disableThingLinking
    } from "$lib/stores"
    import { RemoteSelectingWidget } from "$lib/widgets/dialogWidgets"
    import { sleep } from "$lib/shared/utility"


    let graph: Graph | null = null

    function handleEscape(event: KeyboardEvent) {
        if (event.key === "Escape") cancel()
    }

    async function cancel() {
        await sleep(50) // Allow the click that triggered the cancellation to finish.
        if ($thingLinkingStore.focusEditorMethod) $thingLinkingStore.focusEditorMethod()
        disableThingLinking()
    }

    function submitMethod(selectedItem: SearchOption | null, matchedItems: SearchOption[]) {
        const destThingId = (
            selectedItem ? selectedItem.id :
            matchedItems.length ? matchedItems[0].id :
            null
        )

        if (destThingId) {
            // Get the GUID from that Thing.
            const url = "thing://GUID_GOES_HERE"

            updateThingLinkingUrl(url)
            console.log(url)
            /*
            $textHyperlinkingStore.editor?.chain().focus().setLink({ href: urlField.value, target: '_blank' }).run()
            */

            cancel()
        }
    }
</script>


<svelte:body
    on:keyup|stopPropagation={handleEscape}
/>


{#if $thingLinkingStore.editor && !$thingLinkingStore.url}
    <div
        class="disabled-background"
        style="position: absolute; left: 0px; top: 0px; width: 100%; height: 100%; z-index: 1; background-color: grey; opacity: 0.5;"
        on:click|stopPropagation={cancel}
        on:wheel|preventDefault
        on:keyup|stopPropagation={handleEscape}
    />

    <div
        class="thing-linking-widget"
        on:click|stopPropagation
        on:keyup|stopPropagation={handleEscape}
    >
        <RemoteSelectingWidget
            bind:graph
            {submitMethod}
        /> 
    </div>
{/if}


<style>
    .thing-linking-widget {
        border-radius: 20px;
        outline: solid 1px grey;
        outline-offset: -1px;
        box-shadow: 0 0 20px 10px whitesmoke;

        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        z-index: 1;
        box-sizing: border-box;
        width: calc(100% - 200px);
        height: calc(100% - 200px);
        background-color: #fafafa;

        display: flex;
        flex-direction: row;
        padding: 20px;
    }
</style>