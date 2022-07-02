<script lang="ts">
    import type { Graph } from "$lib/models/graphModels"
    import type { ThingSearchListItem } from "$lib/models/dbModels"
    import type { SearchOption } from "$lib/widgets/navWidgets/searchWidget"
    import {
        thingSearchListStore, addGraph, removeGraph, graphIdsNeedingViewerRefresh, addGraphIdsNeedingViewerRefresh, removeGraphIdsNeedingViewerRefresh
    } from "$lib/stores"
    import { GraphWidget } from "$lib/widgets/graphWidgets"
    import { SearchWidget } from "$lib/widgets/navWidgets"

    export let graph: Graph | null = null
    export let submitMethod: (selectedItem: SearchOption | null, matchedItems: SearchOption[]) => void


    
    let thingIdToShowGraphFor: number | null = null

    let unfilteredArray: {id: number, name: string}[] = []
    
    async function buildUnfilteredArray(thingSearchList: ThingSearchListItem[]) {
        unfilteredArray = []
        for (const thingSearchListItem of thingSearchList) {
            unfilteredArray.push({id: thingSearchListItem.id, name: thingSearchListItem.text})
        }
    }
    $: buildUnfilteredArray($thingSearchListStore)

    function focusMethod(focusedItem: SearchOption | null) {
        if (focusedItem) thingIdToShowGraphFor = focusedItem.id
    }

    



    async function createGraph(thingIdToShowGraphFor: number) {
        // Close any existing Graph.
        if (graph !== null) await removeGraph(graph)
        // Open and build the new Graph.
        graph = await addGraph([thingIdToShowGraphFor], 1)
        graph.graphWidgetStyle.animateZoomAndScroll = false
        await graph.build()
        // Refresh the Graph viewers.
        addGraphIdsNeedingViewerRefresh(graph.id)
    }
    $: if (thingIdToShowGraphFor) {
        createGraph(thingIdToShowGraphFor)
    }
    $: if (!thingIdToShowGraphFor) {
        if (graph !== null) removeGraph(graph)
        graph = null
    }

    // Set up Graph refreshing.
    $: if ( graph?.lifecycleStatus === "built" && $graphIdsNeedingViewerRefresh.includes(graph.id) ) {
        removeGraphIdsNeedingViewerRefresh(graph.id)
        graph = graph // Needed for reactivity.
        graph.allowZoomAndScrollToFit = true
    }






</script>

<div class="remote-selecting-widget">

    <div class="thing-searchbox-container">
        <SearchWidget
            {unfilteredArray}
            placeholderText={"Search Things..." }
            {focusMethod}
            {submitMethod}
            maxHeight={null}
        />
    </div>

    <div class="graph-container">
        {#if graph}
            <GraphWidget
                bind:graph
                rePerspectToThingId={async () => {}}
            />
        {/if}
        <div class="glass-pane" />
    </div>
    
</div>


<style>
    .remote-selecting-widget {
        width: 100%;
        height: 100%;
        background-color: #fafafa;

        display: flex;
        flex-direction: row;
    }

    .thing-searchbox-container {
        outline: solid 1px lightgrey;
        outline-offset: -1px;

        box-sizing: border-box;
        width: 300px;

        display: flex;
        flex-direction: column;
        padding: 0.5rem;
    }

    .graph-container {
        flex: 1 1 0;

        outline: solid 1px lightgrey;
        outline-offset: -1px;

        position: relative;
        min-width: 0;

        padding: 0.5rem;
    }

    .glass-pane {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
    }
</style>