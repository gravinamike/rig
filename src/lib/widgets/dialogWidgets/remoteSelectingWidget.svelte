<script lang="ts">
    import type { ThingSearchListItem } from "$lib/models/graphModels"
    import type { SearchOption } from "$lib/widgets/navWidgets/searchWidget"
    import {
        thingSearchListStore, addGraph, removeGraph, graphIdsNeedingViewerRefresh, addGraphIdsNeedingViewerRefresh, removeGraphIdsNeedingViewerRefresh
    } from "$lib/stores"
    import { GraphWidgetModel } from "$lib/models/widgetModels"
    import { GraphWidget } from "$lib/widgets/graphWidgets"
    import { SearchWidget } from "$lib/widgets/navWidgets"

    export let graphWidgetModel: GraphWidgetModel | null = null
    export let submitMethod: (selectedItem: SearchOption | null, matchedItems: SearchOption[]) => void


    
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
        if (graphWidgetModel !== null) await removeGraph(graphWidgetModel.graph)
        // Open and build the new Graph.
        const graph = await addGraph([thingIdToShowGraphFor], 1)
        await graph.build()
        graphWidgetModel = new GraphWidgetModel(graph)
        graphWidgetModel.graphWidgetStyle.animateZoomAndScroll = false
        // Refresh the Graph viewers.
        addGraphIdsNeedingViewerRefresh(graph.id)
    }
    $: if (thingIdToShowGraphFor) {
        createGraph(thingIdToShowGraphFor)
    }
    $: if (!thingIdToShowGraphFor) {
        if (graphWidgetModel !== null) removeGraph(graphWidgetModel.graph)
        graphWidgetModel = null
    }

    // Set up Graph refreshing.
    $: if ( graphWidgetModel?.graph?.lifecycleStatus === "built" && $graphIdsNeedingViewerRefresh.includes(graphWidgetModel.graph.id) ) {
        removeGraphIdsNeedingViewerRefresh(graphWidgetModel.graph.id)
        graphWidgetModel.graph = graphWidgetModel.graph // Needed for reactivity.
        graphWidgetModel.allowZoomAndScrollToFit = true
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
        {#if graphWidgetModel}
            <GraphWidget
                bind:model={graphWidgetModel}
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