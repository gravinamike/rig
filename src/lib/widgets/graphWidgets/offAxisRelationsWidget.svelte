<script lang="ts">
    // Type imports.
    import type { SpaceDbModel } from "$lib/models/dbModels";
    import type { Graph } from "$lib/models/graphModels"
    import type { ThingWidgetModel } from "$lib/models/widgetModels"

    // Basic UI imports.
    import { tweened } from "svelte/motion"
	import { cubicOut } from "svelte/easing"

    // Constant and utility imports.
    import { zoomBase } from "$lib/shared/constants"
    import { addGraph, removeGraph, graphIdsNeedingViewerRefresh, addGraphIdsNeedingViewerRefresh, removeGraphIdsNeedingViewerRefresh } from "$lib/stores"

    // Import widgets.
    import { GraphOutlineWidget } from "$lib/widgets/graphWidgets"

    export let parentThingWidgetModel: ThingWidgetModel
    export let parentGraph: Graph
    export let rePerspectToThingId: (thingId: number) => Promise<void>


    const parentThingId = parentThingWidgetModel.thingId as number


    $: scale = zoomBase ** parentGraph.graphWidgetStyle.zoom
    let tweenedScale = tweened(1, {duration: 100, easing: cubicOut})
    $: tweenedScale.set(scale)

    const size = 25
    $: diagonal = Math.hypot(size, size)
    $: diagonalOverhang = (diagonal - size) / 2 + 8
    $: numberOfRelations = parentThingWidgetModel.offAxisRelatedThingIds(parentThingWidgetModel.space).length
    let expanded = false

    let graph: Graph | null = null
    async function createGraph() {
        // Close any existing Graph.
        if (graph !== null) await removeGraph(graph)
        // Open and build the new Graph.
        const parentGraphSpace = parentGraph.pThingBaseWidgetModel?.space as SpaceDbModel
        graph = await addGraph([parentThingId], 1, parentGraph, true, parentGraphSpace)
        await graph.build()
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

    let toggleHovered = false
</script>


<div
    class="off-axis-relations-toggle"
    class:expanded
    style="width: {size}px; height: {size}px;"
    on:mouseenter={()=>{toggleHovered = true}}
    on:mouseleave={()=>{toggleHovered = false}}
    on:click={() => {if (numberOfRelations) expanded = !expanded}}
>
    {#if (toggleHovered || expanded)}
        <svg
            class="relationship-image"
            style="width: {size}px; height: {size}px;"
        >
            <line
                x1="{size / 2}" y1="{-diagonalOverhang}"
                x2="{size / 2}" y2="{size + diagonalOverhang - 6 / $tweenedScale}"
                style="stroke-width: {10 / $tweenedScale};"
            />
            <polygon
                points="
                    {size / 2 - 5 / $tweenedScale}, {size + diagonalOverhang - 8 / $tweenedScale}
                    {size / 2 + 5 / $tweenedScale}, {size + diagonalOverhang - 8 / $tweenedScale}
                    {size / 2}, {size + diagonalOverhang}
                "
                style="stroke-width: {3 / $tweenedScale};"
            />
        </svg>
    {/if}

    {#if numberOfRelations}
        <div>+{numberOfRelations}</div>
    {/if}
</div>

{#if numberOfRelations && expanded}
    <div
        class="box off-axis-relations-widget"
        on:wheel|stopPropagation
    >
        {#if graph}
            <GraphOutlineWidget
                bind:graph
                {rePerspectToThingId}
            />
        {/if}
    </div>
{/if}


<style>
    .box {
        border-radius: 10px;
        outline: solid 0.25px lightgrey;
        outline-offset: -0.25px;
        box-shadow: 5px 5px 10px 2px lightgrey;

        box-sizing: border-box;
    }

    .off-axis-relations-toggle {
        position: absolute;
        left: 100%;
        top: 100%;

        font-size: 1.25rem;

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
        
        pointer-events: auto;
    }
</style>