<script lang="ts">
    import type { NoteSearchListItem, ThingSearchListItem } from "$lib/models/constructModels"
    import type { SearchOption } from "$lib/widgets/navWidgets/searchWidget"
    import { thingSearchListStore, noteSearchListStore } from "$lib/stores"
    import { SearchWidget } from "$lib/widgets/navWidgets"

    export let rePerspectToThingId: (id: number) => Promise<void>
    export let padded = true
    export let focused = false
    export let searchType: "thing" | "note" = "thing"






    let unfilteredArray: {id: number, text: string}[] = []
    
    async function buildUnfilteredArray(searchList: (ThingSearchListItem | NoteSearchListItem)[]) {
        unfilteredArray = []
        for (const searchListItem of searchList) {
            unfilteredArray.push({id: (searchListItem.id as number), text: (searchListItem.text as string)})
        }/////////////////////////////////// WILL NEED TO PROCESS TEXT IF IT IS FROM NOTE.
        ///////////// NEED TO PROCESS SUPER-LONG NOTES TO BE SHORTER AND FOCUSED ON HIGHLIGHT TEXT.
    }
    $: if (searchType === "thing") buildUnfilteredArray($thingSearchListStore)
    $: if (searchType === "note") buildUnfilteredArray($noteSearchListStore)








    
    function submitMethod(selectedItem: SearchOption | null, matchedItems: SearchOption[]) {
        if (selectedItem) {
            rePerspectToThingId(selectedItem.id)
        } else if (matchedItems.length) {
            rePerspectToThingId(matchedItems[0].id)
        }
    }



    



</script>


<div
    class="thing-searchbox-viewer"
    class:padded
>

    <SearchWidget
        {unfilteredArray}
        placeholderText={searchType === "thing" ? "Search Things..." : "Search Notes..." }
        focusMethod={() => {}}
        {submitMethod}
        maxHeight={500}
        bind:focused
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