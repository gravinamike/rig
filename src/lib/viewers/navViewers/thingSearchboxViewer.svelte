<script lang="ts">
    import type { ThingSearchListItem } from "$lib/models/constructModels"
    import type { SearchOption } from "$lib/widgets/navWidgets/searchWidget"
    import { thingSearchListStore } from "$lib/stores"
    import { SearchWidget } from "$lib/widgets/navWidgets"

    export let rePerspectToThingId: (id: number) => Promise<void>
    export let padded = true
    export let focused = false


    let unfilteredArray: {id: number, name: string}[] = []
    
    async function buildUnfilteredArray(thingSearchList: ThingSearchListItem[]) {
        unfilteredArray = []
        for (const thingSearchListItem of thingSearchList) {
            unfilteredArray.push({id: (thingSearchListItem.id as number), name: (thingSearchListItem.text as string)})
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


<div
    class="thing-searchbox-viewer"
    class:padded
>

    <SearchWidget
        {unfilteredArray}
        placeholderText={"Search Things..." }
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