<script lang="ts">
    // Import types.
    import type { Graph, Space, Thing } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "./graph"

    // Import basic framework resources.
    import { tweened } from "svelte/motion"
	import { cubicOut } from "svelte/easing"

    // Import constants and stores.
    import { zoomBase } from "$lib/shared/constants"
    import {
        addGraph, removeGraph, reorderingInfoStore, readOnlyMode,
        graphIdsNeedingViewerRefresh, addGraphIdsNeedingViewerRefresh,
        removeGraphIdsNeedingViewerRefresh
    } from "$lib/stores"

    // Import related widgets.
    import { GraphOutlineWidget } from "$lib/widgets/graphWidgets"
    import { defaultGraphWidgetStyle } from "./graph"


    export let parentThing: Thing
    export let parentGraph: Graph
    export let parentGraphWidgetStyle: GraphWidgetStyle
    export let rePerspectToThingId: (thingId: number) => Promise<void>

    
    // ID of the widget's parent Thing.
    $: parentThingId = parentThing.id as number

    // Information about related Things.
    $: numberOfRelations = parentThing.offAxisRelatedThingIds((parentThing.space as Space)).length


    /* Toggle-related attributes. */

    // Toggle state attributes.
    let toggleHovered = false
    $: showToggle = ((!$reorderingInfoStore.reorderInProgress && toggleHovered) || expanded)

    // Scale-related attributes.
    $: scale = zoomBase ** parentGraphWidgetStyle.zoom
    let tweenedScale = tweened(1, {duration: 100, easing: cubicOut})
    $: tweenedScale.set(scale)

    // Toggle arrow geometry.
    const toggleSize = 25
    $: toggleDiagonal = Math.hypot(toggleSize, toggleSize)
    $: toggleDiagonalOverhang = (toggleDiagonal - toggleSize) / 2 + 8



    /* Off-axis-relations-related attributes. */

    // Off-axis-relations state attributes.
    let expanded = false
    $: showOffAxisRelations = numberOfRelations && expanded

    // The off-axis-relations Graph is created and removed when the toggle is
    // expanded and collapsed, respectively.
    let graph: Graph | null = null
    async function createGraph() {
        // Close any existing Graph.
        if (graph !== null) await removeGraph(graph)
        // Open and build the new Graph.
        const parentGraphSpace = parentGraph.pThing?.space as Space
        graph = await addGraph([parentThingId], 1, parentGraph, true, parentGraphSpace)
        graphWidgetStyle = {...defaultGraphWidgetStyle}
        // Refresh the Graph viewers.
        addGraphIdsNeedingViewerRefresh(graph.id)
    }
    $: if (expanded) {
        createGraph()
    }
    $: if (!expanded) {
        if (graph !== null) removeGraph(graph)
        graph = null
    }

    // Set up Graph refreshing.
    $: if ( graph?.lifecycleStatus === "built" && $graphIdsNeedingViewerRefresh.includes(graph.id) ) {
        removeGraphIdsNeedingViewerRefresh(graph.id)
        graph = graph // Needed for reactivity.
    }

    // Graph outline widget style.
    let graphWidgetStyle: GraphWidgetStyle = {...defaultGraphWidgetStyle}
</script>


<!-- Off-axis relations toggle. -->
<div
    class="off-axis-relations-toggle"
    class:expanded
    class:no-mouse-events={$readOnlyMode && !numberOfRelations}

    style="width: {toggleSize}px; height: {toggleSize}px;"

    on:mouseenter={()=>{toggleHovered = true}}
    on:mouseleave={()=>{toggleHovered = false}}
    on:click={() => {if (numberOfRelations) expanded = !expanded}}
    on:keydown={()=>{}}
>
    <!-- Visible toggle image. -->
    {#if showToggle}
        <svg
            class="relationship-image"
            style="width: {toggleSize}px; height: {toggleSize}px;"
        >
            <line
                x1="{toggleSize / 2}" y1="{-toggleDiagonalOverhang}"
                x2="{toggleSize / 2}" y2="{toggleSize + toggleDiagonalOverhang - 6 / $tweenedScale}"
                style="stroke-width: {10 / $tweenedScale};"
            />
            <polygon
                points="
                    {toggleSize / 2 - 5 / $tweenedScale}, {toggleSize + toggleDiagonalOverhang - 8 / $tweenedScale}
                    {toggleSize / 2 + 5 / $tweenedScale}, {toggleSize + toggleDiagonalOverhang - 8 / $tweenedScale}
                    {toggleSize / 2}, {toggleSize + toggleDiagonalOverhang}
                "
                style="stroke-width: {3 / $tweenedScale};"
            />
        </svg>
    {/if}

    <!-- Number-of-off-axis-relations indicator. -->
    {#if numberOfRelations}
        <div>+{numberOfRelations}</div>
    {/if}
</div>

<!-- Off-axis-relations display. -->
{#if showOffAxisRelations}
    <div
        class="off-axis-relations-widget"
        on:wheel|stopPropagation
    >
        {#if graph}
            <GraphOutlineWidget
                bind:graph
                bind:graphWidgetStyle
                {rePerspectToThingId}
            />
        {/if}
    </div>
{/if}


<style>
    .off-axis-relations-toggle {
        position: absolute;
        left: 100%;
        top: 100%;

        font-size: 1.25rem;

        pointer-events: none;
    }

    .off-axis-relations-toggle:not(.no-mouse-events) {
        pointer-events: auto;
        cursor: pointer;
    }

    .relationship-image {
        position: absolute;
        z-index: -1;
        transform: rotate(-45deg);
        
        stroke: black;
        fill: black;
        opacity: 0.5;

        overflow: visible;
    }

    .off-axis-relations-widget {
        position: absolute;
        left: calc(100% + 25px);
        top: calc(100% + 25px);
        width: 300px;
        max-height: 300px;
        z-index: 1;

        overflow-x: hidden;
        overflow-y: auto;
        scrollbar-width: thin;
        
        pointer-events: auto;
        cursor: default;
    }
</style>