<script lang="ts">
    import type { SearchOption } from "$lib/widgets/navWidgets/searchWidget"
    import { SearchWidget } from "$lib/widgets/navWidgets"

    let sourceThingsArray = ["Abigail", "Boromir", "Caleb", "Daphne", "Ephraim", "Felicia", "Gus", "Hermoine"]

    function submitMethod(selectedItem: SearchOption | null, matchedItems: SearchOption[]) {
        if (selectedItem) console.log(selectedItem)
        else console.log(matchedItems)
    }
</script>


<div class="thing-searchbox-viewer">

    <SearchWidget
        unfilteredArray={sourceThingsArray}
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
        padding: 0.75rem;
    }
</style>