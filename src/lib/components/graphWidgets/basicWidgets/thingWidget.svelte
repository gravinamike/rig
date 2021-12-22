<script lang="ts">
    import { saveConfig } from "$lib/shared/config"
    import type { Graph } from "$lib/shared/graph/graph"
    import type { ThingWidgetModel } from "$lib/shared/graph/graphWidgets"

    import { sleep } from "$lib/shared/utility"
    import { pinIdsStore, hoveredThingIdStore } from "$lib/shared/stores/appStores"
    import RelationshipsWidget from "$lib/components/graphWidgets/basicWidgets/relationshipsWidget.svelte"
    import CohortWidget from "$lib/components/graphWidgets/basicWidgets/cohortWidget.svelte"
    import ThingDetailsWidget from "$lib/components/graphWidgets/detailsWidgets/thingDetailsWidget.svelte"
    import { ContextMenuFrame, ContextMenuOption } from "$lib/components/layoutElements/contextMenu"

    export let thingWidgetModel: ThingWidgetModel
    export let graph: Graph
    
    $: thingId = thingWidgetModel.thingId
    $: thingWidgetId = thingWidgetModel.thingWidgetId
    $: text = thingWidgetModel.text
    $: note = thingWidgetModel.note
    $: space = thingWidgetModel.space
    $: cohorts = thingWidgetModel.childCohorts
    $: planeId = thingWidgetModel.parentCohort?.plane?.id || 0
    $: distanceFromFocalPlane = planeId - graph.focalPlaneId
    const planePadding = 20
    $: encapsulatingDepth = thingWidgetModel.parentCohort?.encapsulatingDepth || 0
    $: encapsulatingPadding = encapsulatingDepth >= 0 ? 40 : 20
    $: cohortSize = thingWidgetModel.parentCohort?.members.length || 1
    $: thingSize = graph.graphWidgetStyle.thingSize + planePadding * planeId + encapsulatingPadding * encapsulatingDepth
    $: thingWidth = thingSize
    $: thingHeight = encapsulatingDepth >= 0 ? thingSize : thingSize / cohortSize - 2
    $: opacity = 1 / (1 + (distanceFromFocalPlane < 0 ? 1 : (distanceFromFocalPlane > 0 ? 2 : 0)) * Math.abs(distanceFromFocalPlane))

    let hoveredThingIdStoreValue: number | null
    hoveredThingIdStore.subscribe(value => {hoveredThingIdStoreValue = value})
    $: isHoveredThing = thingId === hoveredThingIdStoreValue

    $: overlap = -Math.min(0, graph.graphWidgetStyle.betweenThingGap / 2)

    const showNotes = false
    let showDetails = false
    let lockDetails = false

    async function handleClick() {
        graph.allowScrollToThingId = true
        graph.thingIdToScrollTo = thingId
        graph = graph // Needed for reactivity.
        await sleep(500) // Allow for scroll time (since there's no actual feedback from the Portal to `await`).

        await graph.setPThingIds([thingId]) // Re-Perspect to this Thing.
        graph.addEntriesToHistory([thingId]) // Add this Thing to the History.
        hoveredThingIdStore.set(null) // Clear the hovered-Thing highlighting.
        graph.allowZoomAndScrollToFit = true
        graph = graph // Needed for reactivity.
    }

    let contextMenu: ContextMenuFrame

    async function addPin() {
        pinIdsStore.update( (current) => { if (!current.includes(thingId)) current.push(thingId); return current } )
        await saveConfig()
    }
</script>


<main
    class="thing-widget"
    style="margin: {-overlap}px;"
>
    
    <!-- The Thing itself. -->
    <div
        id="{thingWidgetId}"
        class="box thing-image { isHoveredThing ? "hovered-thing" : "" }"
        on:mouseenter={()=>{hoveredThingIdStore.set(thingId)}}
        on:mouseleave={()=>{hoveredThingIdStore.set(null)}}
        on:click={handleClick}
        on:contextmenu|preventDefault={contextMenu.openContextMenu}
        style="border-radius: {8 + 4 * encapsulatingDepth}px; width: {thingWidth}px; height: {thingHeight}px; opacity: {opacity}; pointer-events: {distanceFromFocalPlane === 0 ? "auto" : "none"};"
    >
        <div class="thing-text" style="font-size: {encapsulatingDepth >= 0 ? graph.graphWidgetStyle.thingTextSize : graph.graphWidgetStyle.thingTextSize / Math.log2(cohortSize)}px">
            {text}
        </div>
        
        {#if ( showDetails || lockDetails ) && thingWidgetModel.thing}
            <div class="thing-details-container" style="top: {thingHeight - 18}px; left: {thingWidth - 18}px;">
                <ThingDetailsWidget
                    thing={thingWidgetModel.thing}
                />
            </div>
        {/if}
        <div
            class="toggle-button {showDetails || lockDetails ? "pressed" : ""}"
            on:click|stopPropagation={()=>{lockDetails = !lockDetails}}
            on:mouseenter={()=>{showDetails = true}}
            on:mouseleave={()=>{showDetails = false}}
            >
        </div>

        <ContextMenuFrame bind:this={contextMenu}>
            <ContextMenuOption
                text="Add Thing to Pins"
                on:click={addPin}
            />
        </ContextMenuFrame>
    </div>

    {#if showNotes}
        {#if note}
            {@html note.text}
        {:else}
            <h2>NO NOTES YET</h2>
        {/if}
    {/if}

    <!-- The Thing's Relationships and child Cohorts. -->
    {#each cohorts as cohort (cohort.address)}
        {#if cohort.address.halfAxisId && [1, 2, 3, 4].includes(cohort.address.halfAxisId)}
            <RelationshipsWidget
                {cohort}
                {space}
                {graph}
            />
        {/if}
        <CohortWidget
            {cohort}
            bind:graph
        />
    {/each}

</main>


<style>
    .box {
        box-shadow: 5px 5px 10px 2px lightgray;

        box-sizing: border-box;
        height: max-content;
        background-color: white;

        cursor: default;
    }

    .thing-image {
        position: relative;
    }

    .thing-image:hover {
        box-shadow: 5px 5px 10px 10px lightgray;

        z-index: 1;
    }

    .hovered-thing {
        outline: solid 2px black;
    }

    .thing-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);

        font-weight: 600;
        overflow-wrap: break-word;
    }

    .thing-details-container {
        position: absolute;
    }

    .toggle-button {
        border-radius: 8px;
        outline: solid 1px lightgrey;
        outline-offset: -1px;
        
        position: absolute;
        bottom: 1px;
        right: 1px;
        height: 16px;
        width: 16px;

        text-align: center;
        font-size: 0.5rem;
        color: lightgrey;
        
        cursor: pointer;
    }

    .toggle-button.pressed {
        background-color: gainsboro;
    }
</style>