<script lang="ts">
    import type { ThingSearchListItem } from "$lib/models/dbModels"
    import type { SearchOption } from "$lib/widgets/navWidgets/searchWidget"
    import { thingSearchListStore } from "$lib/stores"
    import { SearchWidget } from "$lib/widgets/navWidgets"

    export let rePerspectToThingId: (id: number) => Promise<void>


    let unfilteredArray: {id: number, name: string}[] = []
    
    async function buildUnfilteredArray(thingSearchList: ThingSearchListItem[]) {
        unfilteredArray = []
        for (const thingSearchListItem of thingSearchList) {
            unfilteredArray.push({id: thingSearchListItem.id, name: thingSearchListItem.text})
        }
    }
    $: buildUnfilteredArray($thingSearchListStore)

    function submitMethod(selectedItem: SearchOption | null, matchedItems: SearchOption[]) {
        if (selectedItem) {
            rePerspectToThingId(selectedItem.id)
        } else if (matchedItems.length) {
            rePerspectToThingId(matchedItems[0].id)
        }
    }
</script>


<div class="thing-searchbox-viewer">

    <SearchWidget
        {unfilteredArray}
        placeholderText={"Search Things..." }
        focusMethod={() => {}}
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