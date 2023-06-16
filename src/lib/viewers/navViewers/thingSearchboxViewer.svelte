<script lang="ts">
    // Import types.
    import type { NoteSearchListItem, ThingSearchListItem } from "$lib/models/constructModels"
    import type { SearchOption } from "$lib/widgets/navWidgets/searchWidget"

    // Import stores.
    import { thingSearchListStore, noteSearchListStore } from "$lib/stores"

    // Import related widgets.
    import { SearchWidget } from "$lib/widgets/navWidgets"


    /**
     * @param searchType - Whether to search Things or Notes.
     * @param padded - Whether to put padding around the search field.
     * @param focused - Whether the search field is currently in focus.
     * @param rePerspectToThingId - Method to re-Perspect the Graph to a new Thing ID.
     */
    export let searchType: "thing" | "note" = "thing"
    export let padded = true
    export let focused = false
    export let rePerspectToThingId: (id: number) => Promise<void>


    // The unfiltered array of search list items is built from either the
    // Thing search list store or the Notes search list store, depending on the
    // search type.
    let unfilteredArray: {id: number, thingText: string, noteText: string | null}[] = []
    async function buildUnfilteredArray(searchList: (ThingSearchListItem | NoteSearchListItem)[]) {
        unfilteredArray = []
        for (const searchListItem of searchList) {
            let id: number | null
            let thingText: string | null
            let noteText: string | null

            if ("thingId" in searchListItem) {
                id = searchListItem.thingId
                thingText = searchListItem.thingText
                noteText = searchListItem.text
            } else {
                id = searchListItem.id
                thingText = searchListItem.text
                noteText = null
            }

            if (id && thingText) unfilteredArray.push({
                id: id,
                thingText: thingText,
                noteText: noteText
            })
        }
    }
    $: if (searchType === "thing") buildUnfilteredArray($thingSearchListStore)
    $: if (searchType === "note") buildUnfilteredArray($noteSearchListStore)


    /**
     * Submit method.
     * 
     * When the user submits a search term through the search widget, re-
     * Perspects to the selected Thing (or the first match if there is no
     * selected Thing).
     * @param selectedItem - The currently-selected search item.
     * @param matchedItems - Array of items that match the search term.
     */
    function submitMethod(selectedItem: SearchOption | null, matchedItems: SearchOption[]) {
        if (selectedItem) {
            rePerspectToThingId(selectedItem.id)
        } else if (matchedItems.length) {
            rePerspectToThingId(matchedItems[0].id)
        }
    }
</script>


<!-- Thing searchbox viewer. -->
<div
    class="thing-searchbox-viewer"
    class:padded
>
    <SearchWidget
        {unfilteredArray}
        placeholderText={searchType === "thing" ? "Search Things..." : "Search Notes..." }
        maxHeight={500}
        bind:focused
        focusMethod={() => {}}
        {submitMethod}
    />
</div>


<style>
    .thing-searchbox-viewer.padded {
        outline: solid 1px lightgrey;
        outline-offset: -1px;

        box-sizing: border-box;
        background-color: #fafafa;

        display: flex;
        flex-direction: column;
        padding: 0.5rem;
    }
</style>