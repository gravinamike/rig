<script lang="ts">
    import type { ThingSearchListItem } from "$lib/models/dbModels"
    import type { Graph } from "$lib/models/graphModels"
    import type { SearchOption } from "$lib/widgets/navWidgets/searchWidget"
    import {
        thingSearchListStore, disableRelationshipBeingCreated, remoteRelatingInfoStore, disableRemoteRelating,
        addGraph, removeGraph, graphIdsNeedingViewerRefresh, addGraphIdsNeedingViewerRefresh, removeGraphIdsNeedingViewerRefresh
    } from "$lib/stores"
    import { SearchWidget } from "$lib/widgets/navWidgets"
    import { GraphWidget } from "$lib/widgets/graphWidgets"

    function handleEscape(event: KeyboardEvent) {
        if (event.key === "Escape") cancel()
    }

    function cancel() {
        disableRelationshipBeingCreated()
        disableRemoteRelating()
    }


    let thingIdToShowGraphFor: number | null = null


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
            thingIdToShowGraphFor = selectedItem.id
        } else if (matchedItems.length) {
            thingIdToShowGraphFor = matchedItems[0].id
        }
    }




    let graph: Graph | null = null
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


<svelte:body
    on:keyup={handleEscape}
/>


{#if $remoteRelatingInfoStore.sourceWidgetModel }
    <div
        class="disabled-background"
        style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; z-index: 1; background-color: grey; opacity: 0.5;"
        on:click={cancel}
        on:wheel|preventDefault
    />

    <div class="remote-relating-widget">

        <div class="thing-searchbox-container">
            <SearchWidget
                {unfilteredArray}
                placeholderText={"Search Things..." }
                {submitMethod}
                maxHeight={null}
            />
        </div>

        <div class="graph-container">
            {#if graph}
                <GraphWidget
                    bind:graph
                    rePerspectToThingId={async (thingId) => {}}
                />
            {/if}
            <div class="glass-screen" />
        </div>
        
    </div>
{/if}


<style>
    .remote-relating-widget {
        border-radius: 20px;
        outline: solid 1px grey;
        outline-offset: -1px;
        box-shadow: 0 0 20px 10px whitesmoke;

        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        z-index: 1;
        box-sizing: border-box;
        width: calc(100% - 200px);
        height: calc(100% - 200px);
        background-color: #fafafa;

        display: flex;
        flex-direction: row;
        padding: 20px;
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

    .glass-screen {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
    }
</style>