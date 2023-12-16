<script lang="ts">
    // Import types.
    import type { Graph, ThingSearchListItem } from "$lib/models/constructModels"
    import type { SearchOption } from "$lib/widgets/navWidgets/searchWidget"

    // Import stores.
    import {
        thingSearchListStore, addGraph, removeGraph,
        graphIdsNeedingViewerRefresh, addGraphIdsNeedingViewerRefresh, removeGraphIdsNeedingViewerRefresh, landscapeOrientation

    } from "$lib/stores"

    // Import related widgets.
    import { defaultGraphWidgetStyle, GraphWidget, type GraphWidgetStyle } from "$lib/widgets/graphWidgets"
    import { SearchWidget } from "$lib/widgets/navWidgets"
    import { onMobile } from "$lib/shared/utility"


    // The search text to enter in the search field by default.
    export let startingSearchText: string | null = null
    // The method to be executed when a Thing is selected.
    export let submitMethod: (selectedItem: SearchOption | null, matchedItems: SearchOption[]) => void
    // The widget's internal Graph (distinct from the Graph in a regular Graph Viewer).
    export let graph: Graph | null = null


    // Attributes related to screen orientation.
    $: portraitOrientation = onMobile() && !$landscapeOrientation
    
    // Attributes related to the Graph configuration.
    let graphWidgetStyle: GraphWidgetStyle = {...defaultGraphWidgetStyle}
    let thingIdToShowGraphFor: number | null = null

    // Attributes related to scrolling and zooming.
    let allowZoomAndScrollToFit = false
    let allowScrollToThingId = false
    let thingIdToScrollTo: number | null = null

    // Set up creation of the "unfiltered array" (an array of ID/text pairs for
    // each Thing Search List item in the store.
    let unfilteredArray: {id: number, thingText: string, noteText: string | null}[] = []
    $: buildUnfilteredArray($thingSearchListStore)

    // Set up Graph creation and removal in response to changes in the
    // specified Perspective Thing ID.
    $: if (thingIdToShowGraphFor) {
        createGraph(thingIdToShowGraphFor)
    }
    $: if (!thingIdToShowGraphFor) {
        if (graph !== null) removeGraph(graph)
        graph = null
    }

    // Set up Graph refreshing.
    $: if (
        graph?.lifecycleStatus === "built"
        && $graphIdsNeedingViewerRefresh.includes(graph.id)
    ) {
        removeGraphIdsNeedingViewerRefresh(graph.id)
        graph = graph // Needed for reactivity.
        allowZoomAndScrollToFit = true
    }


    /**
     * Build-unfiltered-array method.
     * 
     * Builds an array of ID/text pairs for each Thing Search List item in the store.
     * @param thingSearchList - A list of Thing Search Items to be processed into the output array.
     */
    async function buildUnfilteredArray(thingSearchList: ThingSearchListItem[]) {
        unfilteredArray = []
        for (const thingSearchListItem of thingSearchList) {
            const id = thingSearchListItem.id
            const thingText = thingSearchListItem.text
            if (id && thingText) unfilteredArray.push({
                id: (thingSearchListItem.id),
                thingText: (thingSearchListItem.text as string),
                noteText: null
            })
        }
    }
    
    /**
     * Create-Graph method.
     * 
     * Replaces any existing Graph in this widget with a new Graph.
     * @param thingIdToShowGraphFor = The ID of the Perspective Thing of the to-be-created Graph.
     */
    async function createGraph(thingIdToShowGraphFor: number) {
        // Close any existing Graph.
        if (graph !== null) await removeGraph(graph)
        // Open and build the new Graph.
        graph = await addGraph([thingIdToShowGraphFor], 1, null, false, true, null)
        graphWidgetStyle.animateZoomAndScroll = false
        // Refresh the Graph viewer.
        addGraphIdsNeedingViewerRefresh(graph.id)
    }

    /**
     * Focus method.
     * 
     * When an option in the search dropdown is in focus, change the Graph to
     * be Perspected on the associated Thing.
     * @param focusedItem - The search option object that is focused (or null if none).
     */
    function focusMethod(focusedItem: SearchOption | null) {
        if (focusedItem) thingIdToShowGraphFor = focusedItem.id
    }
</script>

<!-- Remote-selecting widget. -->
<div
    class="remote-selecting-widget"
    class:portrait-orientation={portraitOrientation}
>

    <!-- Search widget. -->
    <div class="thing-searchbox-container">
        <SearchWidget
            {unfilteredArray}
            placeholderText={"Search Things..." }
            startingText={startingSearchText}
            maxHeight={portraitOrientation ? 500 : null}
            useSubmitButton={onMobile() ? true : false}
            startFocused={true}
            {focusMethod}
            {submitMethod}
        />
    </div>

    <!-- Graph visualizer for Thing search. -->
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
        <!-- The "glass pane" prevents direct interaction with the Graph Widget. -->
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

    .remote-selecting-widget.portrait-orientation {
        flex-direction: column;
    }

    .thing-searchbox-container {
        outline: solid 1px lightgrey;
        outline-offset: -1px;

        box-sizing: border-box;

        display: flex;
        flex-direction: column;
        padding: 0.5rem;
    }

    .remote-selecting-widget:not(.portrait-orientation) .thing-searchbox-container {
        width: 300px;
    }

    .graph-container {
        flex: 1 1 0;

        outline: solid 1px lightgrey;
        outline-offset: -1px;

        position: relative;
        min-width: 0;

        padding: 0.5rem;

        overflow: hidden;
    }

    .glass-pane {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
    }
</style>