<script lang="ts">
    import type { Graph, ThingSearchListItem } from "$lib/models/constructModels"
    import type { SearchOption } from "$lib/widgets/navWidgets/searchWidget"
    import {
        thingSearchListStore, addGraph, removeGraph, graphIdsNeedingViewerRefresh, addGraphIdsNeedingViewerRefresh, removeGraphIdsNeedingViewerRefresh
    } from "$lib/stores"
    import { GraphWidget, type GraphWidgetStyle } from "$lib/widgets/graphWidgets"
    import { SearchWidget } from "$lib/widgets/navWidgets"

    export let submitMethod: (selectedItem: SearchOption | null, matchedItems: SearchOption[]) => void


    let graph: Graph | null = null
    let allowZoomAndScrollToFit: boolean
    let allowScrollToThingId: boolean
    let thingIdToScrollTo: number | null
    let graphWidgetStyle: GraphWidgetStyle



    let thingIdToShowGraphFor: number | null = null

    let unfilteredArray: {id: number, name: string}[] = []
    
    async function buildUnfilteredArray(thingSearchList: ThingSearchListItem[]) {
        unfilteredArray = []
        for (const thingSearchListItem of thingSearchList) {
            unfilteredArray.push({id: (thingSearchListItem.id as number), name: (thingSearchListItem.text as string)})
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
        graphWidgetStyle.animateZoomAndScroll = false
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
        allowZoomAndScrollToFit = true
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
                {graphWidgetStyle}
                bind:allowZoomAndScrollToFit
                bind:allowScrollToThingId
                bind:thingIdToScrollTo
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