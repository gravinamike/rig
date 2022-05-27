<script lang="ts">
    import type { ThingSearchListItem } from "$lib/models/dbModels"
    import type { SearchOption } from "$lib/widgets/navWidgets/searchWidget"
    import { thingSearchListStore } from "$lib/stores"
    import { SearchWidget } from "$lib/widgets/navWidgets"


    let unfilteredArray: {id: number, name: string}[] = []
    
    async function buildUnfilteredArray(thingSearchList: ThingSearchListItem[]) {
        unfilteredArray = []
        for (const thingSearchListItem of thingSearchList) {
            unfilteredArray.push({id: thingSearchListItem.id, name: thingSearchListItem.text})
        }
    }
    $: buildUnfilteredArray($thingSearchListStore)

    function submitMethod(selectedItem: SearchOption | null, matchedItems: SearchOption[]) {
        if (selectedItem) console.log(selectedItem)
        else console.log(matchedItems)
    }
</script>


<div class="thing-searchbox-viewer">

    <SearchWidget
        {unfilteredArray}
        placeholderText={"Search Things..." }
        {submitMethod}
    />

</div>


<style>
    .thing-searchbox-viewer {
        outline: solid 1px lightgrey;
        outline-offset: -1px;

        box-sizing: border-box;
        background-color: #fafafa;

        display: flex;
        flex-direction: column;
        padding: 0.5rem;
    }
</style>