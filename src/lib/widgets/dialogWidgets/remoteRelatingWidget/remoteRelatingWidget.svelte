<script lang="ts">
    //import type { ThingSearchListItem } from "$lib/models/dbModels"
    import type { Graph } from "$lib/models/graphModels"
    import type { ThingWidgetModel } from "$lib/models/widgetModels"
    import type { SearchOption } from "$lib/widgets/navWidgets/searchWidget"
    import {
        thingSearchListStore, setRelationshipBeingCreatedDestWidgetModel, disableRelationshipBeingCreated, remoteRelatingInfoStore, disableRemoteRelating,
        addGraph, removeGraph, graphIdsNeedingViewerRefresh, addGraphIdsNeedingViewerRefresh, removeGraphIdsNeedingViewerRefresh, relationshipBeingCreatedInfoStore
    } from "$lib/stores"
    //import { SearchWidget } from "$lib/widgets/navWidgets"
    //import { GraphWidget } from "$lib/widgets/graphWidgets"
    import { RemoteSelectingWidget } from "$lib/widgets/dialogWidgets"


    function handleEscape(event: KeyboardEvent) {
        if (event.key === "Escape") cancel()
    }

    function cancel() {
        disableRelationshipBeingCreated()
        disableRemoteRelating()
    }


    //let thingIdToShowGraphFor: number | null = null


    /*let unfilteredArray: {id: number, name: string}[] = []
    
    async function buildUnfilteredArray(thingSearchList: ThingSearchListItem[]) {
        unfilteredArray = []
        for (const thingSearchListItem of thingSearchList) {
            unfilteredArray.push({id: thingSearchListItem.id, name: thingSearchListItem.text})
        }
    }
    $: buildUnfilteredArray($thingSearchListStore)*/

    /*function focusMethod(focusedItem: SearchOption | null) {
        if (focusedItem) thingIdToShowGraphFor = focusedItem.id
    }*/

    function submitMethod(selectedItem: SearchOption | null, matchedItems: SearchOption[]) {
        const destThingId = (
            selectedItem ? selectedItem.id :
            matchedItems.length ? matchedItems[0].id :
            null
        )

        const relatableForCurrentDrag = (
            // There is a drag-relate in progress,
            $remoteRelatingInfoStore.sourceWidgetModel
            // and the source of the drag is not *this* Thing.
            && !(
                $remoteRelatingInfoStore.sourceWidgetModel.kind === "thingWidgetModel"
                && $remoteRelatingInfoStore.sourceWidgetModel.thingId === destThingId
            )
        ) ?
            true :
            false

        if (
            destThingId
            && relatableForCurrentDrag
            && graph?.rootThingCohortWidgetModel?.cohort.members[0]
        ) setRelationshipBeingCreatedDestWidgetModel(
            graph?.rootThingCohortWidgetModel?.cohort.members[0] as ThingWidgetModel
        )
    }



    let graph: Graph | null = null
    /*async function createGraph(thingIdToShowGraphFor: number) {
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
    }*/







</script>


<svelte:body
    on:keyup={handleEscape}
/>


{#if $remoteRelatingInfoStore.sourceWidgetModel && !$relationshipBeingCreatedInfoStore.destWidgetModel }
    <div
        class="disabled-background"
        style="position: absolute; left: 0px; top: 0px; width: 100%; height: 100%; z-index: 1; background-color: grey; opacity: 0.5;"
        on:click={cancel}
        on:wheel|preventDefault
    />

    <div class="remote-relating-widget">

        <!--<div class="thing-searchbox-container">
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
        </div>-->

        <RemoteSelectingWidget
            bind:graph
            {submitMethod}
        />
        
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
</style>